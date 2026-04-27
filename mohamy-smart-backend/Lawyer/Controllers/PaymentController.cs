using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Setting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Json;

namespace Lawyer.Controllers
{
	[Route("api/v1/[controller]")]
	[ApiController]
	public class PaymentController : AppControllerBase
	{
		private readonly IPaymobService _paymobService;
		private readonly IUnitOfWork _unitOfWork;
		private readonly PaymobSettings _paymobSettings;
		private readonly IConfiguration _configuration;

		public PaymentController(
			IPaymobService paymobService,
			IUnitOfWork unitOfWork,
			IOptions<PaymobSettings> paymobSettings,
			IConfiguration configuration)
		{
			_paymobService = paymobService;
			_unitOfWork = unitOfWork;
			_paymobSettings = paymobSettings.Value;
			_configuration = configuration;
		}

		[Authorize]
		[HttpPost("initiate")]
		public async Task<IActionResult> InitiatePayment(
			[FromQuery] int subscriptionId,
			[FromQuery] string paymentMethod,
			[FromQuery] string billingCycle = "monthly",
			CancellationToken ct = default)
		{
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId))
				return Unauthorized(Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
				.FirstOrDefaultAsync(l => l.ApplicationUserId == Guid.Parse(userId));

			if (lawyer == null)
				return BadRequest(Result<string>.Error(System.Net.HttpStatusCode.BadRequest, "Lawyer profile not found."));

			var result = await _paymobService.InitiatePaymentAsync(lawyer.Id, subscriptionId, paymentMethod, billingCycle, ct);
			return CreateResponse(result);
		}

		[AllowAnonymous]
		[HttpGet("callback")]
		public async Task<IActionResult> Callback(CancellationToken ct)
		{
			var frontendBaseUrl = _configuration["FrontendBaseUrl"]
				?? throw new InvalidOperationException("FrontendBaseUrl is not configured in appsettings.json. Add \"FrontendBaseUrl\": \"http://localhost:5078\" to your configuration.");

			try
			{
				var data = string.Concat(
					Request.Query["amount_cents"],
					Request.Query["created_at"],
					Request.Query["currency"],
					Request.Query["error_occured"],
					Request.Query["has_parent_transaction"],
					Request.Query["id"],
					Request.Query["integration_id"],
					Request.Query["is_3d_secure"],
					Request.Query["is_auth"],
					Request.Query["is_capture"],
					Request.Query["is_refunded"],
					Request.Query["is_standalone_payment"],
					Request.Query["is_voided"],
					Request.Query["order"],
					Request.Query["owner"],
					Request.Query["pending"],
					Request.Query["source_data.pan"],
					Request.Query["source_data.sub_type"],
					Request.Query["source_data.type"],
					Request.Query["success"]
				);

				var receivedHmac = Request.Query["hmac"].ToString();
				var isValid = _paymobService.VerifyCallbackHmac(data, receivedHmac);

				if (!isValid)
					return Redirect($"{frontendBaseUrl}?status=error");

				var success = Request.Query["success"].ToString().Equals("true", StringComparison.OrdinalIgnoreCase);
				var merchantOrderId = Request.Query["merchant_order_id"].ToString();

				if (string.IsNullOrWhiteSpace(merchantOrderId) || merchantOrderId.Length > 50)
					return Redirect($"{frontendBaseUrl}?status=error");

				foreach (var c in merchantOrderId)
				{
					if (!char.IsLetterOrDigit(c) && c != '-' && c != '_')
						return Redirect($"{frontendBaseUrl}?status=error");
				}

				await _paymobService.HandleLocalGetCallbackAsync(merchantOrderId, success, data, receivedHmac, ct);

				if (success)
					return Redirect($"{frontendBaseUrl}?status=success&transactionId={merchantOrderId}");
				else
					return Redirect($"{frontendBaseUrl}?status=failed&transactionId={merchantOrderId}");
			}
			catch
			{
				return Redirect($"{frontendBaseUrl}/payment/status?status=error");
			}
		}

		[AllowAnonymous]
		// T010: exempt from CSRF — this is an inbound Paymob server-to-server call,
		// not browser-originated. It has its own HMAC verification in PaymobService.
		[IgnoreAntiforgeryToken]
		[HttpPost("server-callback")]
		public async Task<IActionResult> ServerCallback(CancellationToken ct)
		{
			var hmac = Request.Query["hmac"].ToString();
			if (string.IsNullOrEmpty(hmac))
				return BadRequest("Missing HMAC");

			using var reader = new StreamReader(Request.Body);
			var body = await reader.ReadToEndAsync(ct);
			using var doc = JsonDocument.Parse(body);
			var payload = doc.RootElement;

			var result = await _paymobService.HandleServerCallbackAsync(hmac, payload, ct);
			return CreateResponse(result);
		}

		[Authorize]
		[HttpGet("status/{paymentId:guid}")]
		public async Task<IActionResult> GetPaymentStatus(Guid paymentId, CancellationToken ct)
		{
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId))
				return Unauthorized(Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
				.FirstOrDefaultAsync(l => l.ApplicationUserId == Guid.Parse(userId));
			if (lawyer == null)
				return BadRequest(Result<string>.Error(System.Net.HttpStatusCode.BadRequest, "Lawyer profile not found."));

			var result = await _paymobService.GetPaymentStatusAsync(paymentId, lawyer.Id, ct);
			return CreateResponse(result);
		}

		[Authorize]
		[HttpGet("status/by-transaction/{transactionId}")]
		public async Task<IActionResult> GetPaymentStatusByTransactionId(string transactionId, CancellationToken ct)
		{
			if (string.IsNullOrEmpty(transactionId) || transactionId.Length > 50)
				return BadRequest(Result<string>.Error(System.Net.HttpStatusCode.BadRequest, "Transaction ID is invalid."));

			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId))
				return Unauthorized(Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
				.FirstOrDefaultAsync(l => l.ApplicationUserId == Guid.Parse(userId));
			if (lawyer == null)
				return BadRequest(Result<string>.Error(System.Net.HttpStatusCode.BadRequest, "Lawyer profile not found."));

			var result = await _paymobService.GetPaymentStatusByTransactionIdAsync(transactionId, lawyer.Id, ct);
			return CreateResponse(result);
		}

		[Authorize]
		[HttpGet("history")]
		public async Task<IActionResult> GetPaymentHistory([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
		{
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId))
				return Unauthorized(Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
				.FirstOrDefaultAsync(l => l.ApplicationUserId == Guid.Parse(userId));

			if (lawyer == null)
				return BadRequest(Result<string>.Error(System.Net.HttpStatusCode.BadRequest, "Lawyer profile not found."));

			var result = await _paymobService.GetPaymentHistoryAsync(lawyer.Id, ct, pageNumber, pageSize);
			return CreateResponse(result);
		}
	}
}
