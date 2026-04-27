using Lawyer.Application.Dtos;
using Lawyer.Application.IServices;
using Lawyer.Core.Common;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Lawyer.Core.Setting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Lawyer.Application.Services
{
	public class PaymobService : IPaymobService
	{
		private readonly IUnitOfWork _unitOfWork;
		private readonly ISubscriptionService _subscriptionService;
		private readonly IHttpClientFactory _httpClientFactory;
		private readonly PaymobSettings _settings;
		private readonly ILogger<PaymobService> _logger;

		public PaymobService(
			IUnitOfWork unitOfWork,
			ISubscriptionService subscriptionService,
			IHttpClientFactory httpClientFactory,
			IOptions<PaymobSettings> settings,
			ILogger<PaymobService> logger)
		{
			_unitOfWork = unitOfWork;
			_subscriptionService = subscriptionService;
			_httpClientFactory = httpClientFactory;
			_settings = settings.Value;
			_logger = logger;
		}

		public async Task<Result<InitiatePaymentResponseDto>> InitiatePaymentAsync(
			Guid lawyerId, int subscriptionId, string paymentMethod, string billingCycle, CancellationToken ct)
		{
			if (paymentMethod?.ToLower() is not ("card" or "wallet"))
				return ApiExceptionResponse.BadRequest<InitiatePaymentResponseDto>("طريقة الدفع غير صالحة. يجب أن تكون 'card' أو 'wallet'");

			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
				.FirstOrDefaultAsync(x => x.Id == lawyerId, ct, x => x.ApplicationUser);

			if (lawyer == null)
				return ApiExceptionResponse.NotFound<InitiatePaymentResponseDto>("حساب المحامي غير موجود.");

			var plan = await _unitOfWork.Repository<Subscription>().GetByIdAsync(subscriptionId);
			if (plan == null)
				return ApiExceptionResponse.NotFound<InitiatePaymentResponseDto>("باقة الاشتراك غير موجودة.");

			var isYearly = billingCycle?.ToLower() == "yearly";

			if (isYearly && !plan.YearlyPrice.HasValue)
				return ApiExceptionResponse.BadRequest<InitiatePaymentResponseDto>("Yearly billing is not available for this plan");

			var price = isYearly && plan.YearlyPrice.HasValue ? plan.YearlyPrice.Value : plan.Price;
			var amountCents = (int)(price * 100);

			// Bypass Paymob for Free/Zero-Price Plans
			if (amountCents == 0)
			{
				var subResult = await _subscriptionService.SubscribeAsync(lawyerId, subscriptionId, isYearly ? "yearly" : "monthly", ct);
				if (!subResult.IsSuccess)
					return ApiExceptionResponse.BadRequest<InitiatePaymentResponseDto>(subResult.Message);
				
				return ApiExceptionResponse.Success(new InitiatePaymentResponseDto
				{
					PaymentId = Guid.Empty,
					PaymentUrl = string.Empty,
					Status = PaymentStatus.Success.ToString()
				}, "تم تفعيل الباقة بنجاح.");
			}

			// Prevent duplicate initiation: check for recent Pending payment (within 5 minutes)
			var existingPending = await _unitOfWork.Repository<Payment>()
				.FirstOrDefaultAsync(x => x.LawyerId == lawyerId
					&& x.SubscriptionId == subscriptionId
					&& x.Status == PaymentStatus.Pending, ct);

			if (existingPending != null)
			{
				var ageInMinutes = (DateTime.UtcNow - existingPending.Created).TotalMinutes;

				if (ageInMinutes < 5)
				{
					// Recent pending payment — block duplicate for 5 minutes
					_logger.LogInformation("Blocking duplicate: pending payment {PaymentId} is {Minutes}m old", existingPending.Id, (int)ageInMinutes);
					return ApiExceptionResponse.BadRequest<InitiatePaymentResponseDto>(
						"لديك عملية دفع قيد الانتظار لهذه الباقة. يرجى إتمامها أو المحاولة مرة أخرى بعد 5 دقائق.");
				}

				// Stale pending payment — mark as expired and allow new one
				existingPending.Status = PaymentStatus.Expired;
				await _unitOfWork.Repository<Payment>().Update(existingPending);
				await _unitOfWork.SaveChangesAsync(ct);
				_logger.LogInformation("Expired previous pending payment {PaymentId} for Lawyer {LawyerId} to allow retry", existingPending.Id, lawyerId);
			}

			var integrationId = paymentMethod.ToLower() switch
			{
				"card" => _settings.CardIntegrationId,
				"wallet" => _settings.MobileIntegrationId,
				_ => null
			};

			if (integrationId == null)
				return ApiExceptionResponse.BadRequest<InitiatePaymentResponseDto>("طريقة الدفع غير صالحة. يرجى استخدام البطاقة البنكية أو المحفظة الإلكترونية.");

			var specialReference = Guid.NewGuid().ToString("N")[..12];

			var intentionPayload = new
			{
				amount = amountCents,
				currency = "EGP",
				payment_methods = new[] { int.TryParse(integrationId, out var integrationIdInt) ? integrationIdInt : 0 },
				billing_data = new
				{
					apartment = "N/A",
					first_name = lawyer.ApplicationUser.FullName?.Split(' ').FirstOrDefault() ?? "N/A",
					last_name = lawyer.ApplicationUser.FullName?.Split(' ').LastOrDefault() ?? "N/A",
					street = "N/A",
					building = "N/A",
					phone_number = lawyer.ApplicationUser.PhoneNumber ?? "N/A",
					country = "EG",
					email = lawyer.ApplicationUser.Email ?? "N/A",
					floor = "N/A",
					state = "N/A",
					city = "N/A"
				},
				items = new[]
				{
					new
					{
						name = $"Subscription Plan - {plan.Name} ({(isYearly ? "Yearly" : "Monthly")})",
						amount = amountCents,
						description = $"Lawyer Subscription Payment for {plan.Name} plan ({(isYearly ? "Yearly" : "Monthly")})",
						quantity = 1
					}
				},
				extras = new Dictionary<string, string>
				{
					{ "lawyerId", lawyerId.ToString() },
					{ "subscriptionId", subscriptionId.ToString() },
					{ "billingCycle", isYearly ? "yearly" : "monthly" }
				},
				special_reference = specialReference,
				merchant_order_id = specialReference,
				expiration = 3600,
				redirection_url = $"{_settings.CallbackBaseUrl}/api/v1/payment/callback",
				notification_url = $"{_settings.CallbackBaseUrl}/api/v1/payment/server-callback"
			};

			try
			{
				var client = _httpClientFactory.CreateClient("Paymob");
				var request = new HttpRequestMessage(HttpMethod.Post, "v1/intention/");
				request.Headers.Authorization = new AuthenticationHeaderValue("Token", _settings.SecretKey);
				request.Content = new StringContent(
					JsonSerializer.Serialize(intentionPayload),
					Encoding.UTF8,
					"application/json");

				var response = await client.SendAsync(request, ct);
				var responseContent = await response.Content.ReadAsStringAsync(ct);

				if (!response.IsSuccessStatusCode)
				{
					_logger.LogError("Paymob API error: {StatusCode} - {Error}", response.StatusCode, responseContent);
					return ApiExceptionResponse.ServerError<InitiatePaymentResponseDto>("تعذر إنشاء طلب الدفع. يرجى المحاولة لاحقاً.");
				}

				using var doc = JsonDocument.Parse(responseContent);
				var clientSecret = doc.RootElement.GetProperty("client_secret").GetString();

				// Save payment record
				var payment = new Payment
				{
					LawyerId = lawyerId,
					SubscriptionId = subscriptionId,
					Amount = price,
					Currency = "EGP",
					PaymentMethod = paymentMethod,
					TransactionId = specialReference,
					Status = PaymentStatus.Pending,
					BillingCycle = isYearly ? "yearly" : "monthly"
				};

				await _unitOfWork.Repository<Payment>().AddAsync(payment);
				await _unitOfWork.SaveChangesAsync(ct);

				var paymentUrl = $"https://accept.paymob.com/unifiedcheckout/?publicKey={_settings.PublicKey}&clientSecret={clientSecret}";

				_logger.LogInformation("Payment initiated for Lawyer {LawyerId}, Plan {PlanName}, TransactionId {TransactionId}",
					lawyerId, plan.Name, specialReference);

				return ApiExceptionResponse.Success(new InitiatePaymentResponseDto
				{
					PaymentId = payment.Id,
					PaymentUrl = paymentUrl,
					Status = payment.Status.ToString()
				}, "Payment initiated successfully");
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error creating Paymob payment intention");
				return ApiExceptionResponse.ServerError<InitiatePaymentResponseDto>("حدث خطأ غير متوقع أثناء معالجة الدفع. يرجى المحاولة لاحقاً.");
			}
		}

		public async Task<Result<string>> HandleServerCallbackAsync(string hmac, JsonElement payload, CancellationToken ct)
		{
			try
			{
				var obj = payload.GetProperty("obj");

				var data = string.Concat(
					GetField(obj, "amount_cents"),
					GetField(obj, "created_at"),
					GetField(obj, "currency"),
					GetField(obj, "error_occured"),
					GetField(obj, "has_parent_transaction"),
					GetField(obj, "id"),
					GetField(obj, "integration_id"),
					GetField(obj, "is_3d_secure"),
					GetField(obj, "is_auth"),
					GetField(obj, "is_capture"),
					GetField(obj, "is_refunded"),
					GetField(obj, "is_standalone_payment"),
					GetField(obj, "is_voided"),
					GetNestedField(obj, "order.id"),
					GetField(obj, "owner"),
					GetField(obj, "pending"),
					GetNestedField(obj, "source_data.pan"),
					GetNestedField(obj, "source_data.sub_type"),
					GetNestedField(obj, "source_data.type"),
					GetField(obj, "success")
				);

				var calculatedHmac = ComputeHmacSHA512(data, _settings.HMAC);
				if (!hmac.Equals(calculatedHmac, StringComparison.OrdinalIgnoreCase))
				{
					_logger.LogWarning("Invalid HMAC in server callback");
					return ApiExceptionResponse.Unauthorized<string>("Invalid HMAC signature");
				}

				var merchantOrderId = GetNestedField(obj, "order.merchant_order_id");
				var success = GetField(obj, "success").Equals("true", StringComparison.OrdinalIgnoreCase);
				var paymobTransactionId = GetField(obj, "id");

				var payment = await _unitOfWork.Repository<Payment>()
					.FirstOrDefaultAsync(x => x.TransactionId == merchantOrderId, ct);

				if (payment == null)
				{
					_logger.LogWarning("Payment not found for merchant_order_id: {OrderId}", merchantOrderId);
					return ApiExceptionResponse.NotFound<string>("Payment not found");
				}

				// Idempotency: skip if already processed
				if (payment.Status != PaymentStatus.Pending)
				{
					_logger.LogInformation("Payment {TransactionId} already processed with status {Status}", merchantOrderId, payment.Status);
					return ApiExceptionResponse.Success("Payment already processed");
				}

				// Save raw callback payload for audit/debugging
				payment.CallbackPayload = payload.ToString();
				payment.PaymobTransactionId = paymobTransactionId;

				// Use DB transaction to ensure atomicity: payment update + subscription activation succeed or fail together
				using var transaction = await _unitOfWork.BeginTransactionAsync();
				try
				{
					if (success)
					{
						payment.Status = PaymentStatus.Success;
						await _unitOfWork.Repository<Payment>().Update(payment);
						await _unitOfWork.SaveChangesAsync(ct);

						// Activate subscription within the same transaction
						await _subscriptionService.SubscribeAsync(payment.LawyerId, payment.SubscriptionId, payment.BillingCycle ?? "monthly", ct);

						await transaction.CommitAsync(ct);

						_logger.LogInformation("Payment successful. Subscription activated for Lawyer {LawyerId}, Plan {SubscriptionId}",
							payment.LawyerId, payment.SubscriptionId);

						return ApiExceptionResponse.Success("Payment processed successfully. Subscription activated.");
					}
					else
					{
						payment.Status = PaymentStatus.Failed;
						await _unitOfWork.Repository<Payment>().Update(payment);
						await _unitOfWork.SaveChangesAsync(ct);

						await transaction.CommitAsync(ct);

						_logger.LogWarning("Payment failed for TransactionId {TransactionId}", merchantOrderId);

						return ApiExceptionResponse.Success("Payment failed. Subscription not activated.");
					}
				}
				catch (DbUpdateConcurrencyException)
				{
					// Another request already processed this payment (Paymob webhook retry)
					await transaction.RollbackAsync(ct);
					_logger.LogInformation("Concurrent callback detected for {TransactionId}, skipping (already processed)", merchantOrderId);
					return ApiExceptionResponse.Success("Payment already processed");
				}
				catch
				{
					await transaction.RollbackAsync(ct);
					throw;
				}
			}
			catch (DbUpdateConcurrencyException)
			{
				return ApiExceptionResponse.Success("Payment already processed");
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error processing server callback");
				return ApiExceptionResponse.ServerError<string>("Error processing payment callback");
			}
		}

		public async Task<Result<string>> HandleLocalGetCallbackAsync(string merchantOrderId, bool success, string hmacData, string receivedHmac, CancellationToken ct)
		{
			try
			{
				if (!VerifyCallbackHmac(hmacData, receivedHmac))
				{
					_logger.LogWarning("Invalid HMAC in local callback for merchant_order_id: {OrderId}", merchantOrderId);
					return ApiExceptionResponse.Unauthorized<string>("Invalid HMAC signature");
				}

				var payment = await _unitOfWork.Repository<Payment>()
					.FirstOrDefaultAsync(x => x.TransactionId == merchantOrderId, ct);

				if (payment == null)
				{
					_logger.LogWarning("Local Callback: Payment not found for merchant_order_id: {OrderId}", merchantOrderId);
					return ApiExceptionResponse.NotFound<string>("Payment not found");
				}

				if (payment.Status != PaymentStatus.Pending)
				{
					return ApiExceptionResponse.Success("Payment already processed");
				}

				using var transaction = await _unitOfWork.BeginTransactionAsync();
				try
				{
					if (success)
					{
						payment.Status = PaymentStatus.Success;
						await _unitOfWork.Repository<Payment>().Update(payment);
						await _unitOfWork.SaveChangesAsync(ct);

						await _subscriptionService.SubscribeAsync(payment.LawyerId, payment.SubscriptionId, payment.BillingCycle ?? "monthly", ct);
						await transaction.CommitAsync(ct);

						_logger.LogInformation("Local Callback: Payment successful. Subscription activated for Lawyer {LawyerId}", payment.LawyerId);
						return ApiExceptionResponse.Success("Subscription activated.");
					}
					else
					{
						payment.Status = PaymentStatus.Failed;
						await _unitOfWork.Repository<Payment>().Update(payment);
						await _unitOfWork.SaveChangesAsync(ct);
						await transaction.CommitAsync(ct);

						_logger.LogWarning("Local Callback: Payment failed for TransactionId {TransactionId}", merchantOrderId);
						return ApiExceptionResponse.Success("Payment failed.");
					}
				}
				catch (Exception)
				{
					await transaction.RollbackAsync(ct);
					throw;
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error processing local GET callback");
				return ApiExceptionResponse.ServerError<string>("Error processing payment callback");
			}
		}

		public bool VerifyCallbackHmac(string data, string receivedHmac)
		{
			var calculatedHmac = ComputeHmacSHA512(data, _settings.HMAC);
			return receivedHmac.Equals(calculatedHmac, StringComparison.OrdinalIgnoreCase);
		}

		public async Task<Result<PaymentStatusDto>> GetPaymentStatusAsync(Guid paymentId, Guid lawyerId, CancellationToken ct)
		{
			var payment = await _unitOfWork.Repository<Payment>()
				.FirstOrDefaultAsync(x => x.Id == paymentId, ct);

			if (payment == null)
				return ApiExceptionResponse.NotFound<PaymentStatusDto>("عملية الدفع غير موجودة.");

			// Ownership check — a lawyer may only view their own payments
			if (payment.LawyerId != lawyerId)
				return ApiExceptionResponse.Unauthorized<PaymentStatusDto>("لا تملك صلاحية عرض هذه المعاملة.");

			var isSubscriptionActive = false;
			string activePlanName = string.Empty;
			if (payment.Status == PaymentStatus.Success)
			{
				var lawyerSub = await _unitOfWork.Repository<LawyerSubscription>()
					.AsQueryable()
					.Include(ls => ls.Subscription)
					.FirstOrDefaultAsync(x => x.LawyerId == payment.LawyerId && x.IsActive, ct);
				isSubscriptionActive = lawyerSub != null;
				activePlanName = lawyerSub?.Subscription?.Name ?? string.Empty;
			}

			return ApiExceptionResponse.Success(new PaymentStatusDto
			{
				PaymentId = payment.Id,
				Status = payment.Status.ToString(),
				SubscriptionActivated = isSubscriptionActive,
				ActivePlanName = activePlanName
			});
		}

		public async Task<Result<PaymentStatusDto>> GetPaymentStatusByTransactionIdAsync(string transactionId, Guid lawyerId, CancellationToken ct)
		{
			var payment = await _unitOfWork.Repository<Payment>()
				.FirstOrDefaultAsync(x => x.TransactionId == transactionId, ct);

			if (payment == null)
				return ApiExceptionResponse.NotFound<PaymentStatusDto>("عملية الدفع غير موجودة.");

			// Ownership check — a lawyer may only view their own payments
			if (payment.LawyerId != lawyerId)
				return ApiExceptionResponse.Unauthorized<PaymentStatusDto>("لا تملك صلاحية عرض هذه المعاملة.");

			var isSubscriptionActive = false;
			string activePlanName = string.Empty;
			if (payment.Status == PaymentStatus.Success)
			{
				var lawyerSub = await _unitOfWork.Repository<LawyerSubscription>()
					.AsQueryable()
					.Include(ls => ls.Subscription)
					.FirstOrDefaultAsync(x => x.LawyerId == payment.LawyerId && x.IsActive, ct);
				isSubscriptionActive = lawyerSub != null;
				activePlanName = lawyerSub?.Subscription?.Name ?? string.Empty;
			}

			return ApiExceptionResponse.Success(new PaymentStatusDto
			{
				PaymentId = payment.Id,
				Status = payment.Status.ToString(),
				SubscriptionActivated = isSubscriptionActive,
				ActivePlanName = activePlanName
			});
		}

		public async Task<Result<PagedResponse<PaymentHistoryDto>>> GetPaymentHistoryAsync(Guid lawyerId, CancellationToken ct, int pageNumber = 1, int pageSize = 20)
		{
			if (pageNumber <= 0) pageNumber = 1;
			if (pageSize > 100) pageSize = 100;
			if (pageSize <= 0) pageSize = 20;

			var query = _unitOfWork.Repository<Payment>()
				.AsQueryable()
				.AsNoTracking()
				.Where(x => x.LawyerId == lawyerId)
				.Include(x => x.Subscription)
				.OrderByDescending(x => x.Created);

			var totalCount = await query.CountAsync(ct);

			var payments = await query
				.Skip((pageNumber - 1) * pageSize)
				.Take(pageSize)
				.Select(x => new PaymentHistoryDto
				{
					PaymentId = x.Id,
					Amount = x.Amount,
					PaymentMethod = x.PaymentMethod,
					Status = x.Status.ToString(),
					CreatedAt = x.Created
				})
				.ToListAsync(ct);

			var pagedResponse = new PagedResponse<PaymentHistoryDto>(payments, pageNumber, pageSize, totalCount);

			return ApiExceptionResponse.Success(pagedResponse, "تم استرجاع سجل المدفوعات بنجاح.");
		}

		#region HMAC Helpers

		private string ComputeHmacSHA512(string data, string secret)
		{
			var keyBytes = Encoding.UTF8.GetBytes(secret);
			var dataBytes = Encoding.UTF8.GetBytes(data);
			using var hmac = new HMACSHA512(keyBytes);
			var hash = hmac.ComputeHash(dataBytes);
			return BitConverter.ToString(hash).Replace("-", "").ToLower();
		}

		private static string GetField(JsonElement el, string prop)
		{
			if (el.TryGetProperty(prop, out var val))
			{
				if (val.ValueKind == JsonValueKind.True) return "true";
				if (val.ValueKind == JsonValueKind.False) return "false";
				return val.ToString() ?? "";
			}
			return "";
		}

		private static string GetNestedField(JsonElement el, string path)
		{
			var parts = path.Split('.');
			var current = el;
			foreach (var part in parts)
			{
				if (!current.TryGetProperty(part, out current))
					return "";
			}
			if (current.ValueKind == JsonValueKind.True) return "true";
			if (current.ValueKind == JsonValueKind.False) return "false";
			return current.ToString() ?? "";
		}

		#endregion
	}
}
