using Lawyer.Application.Dtos;
using Lawyer.Core.Common;
using Lawyer.Core.Exceptions;
using System.Text.Json;

namespace Lawyer.Application.IServices
{
	public interface IPaymobService
	{
		Task<Result<InitiatePaymentResponseDto>> InitiatePaymentAsync(
			Guid lawyerId, int subscriptionId, string paymentMethod, string billingCycle, CancellationToken ct);

		Task<Result<string>> HandleServerCallbackAsync(string hmac, JsonElement payload, CancellationToken ct);

		Task<Result<string>> HandleLocalGetCallbackAsync(string merchantOrderId, bool success, string hmacData, string receivedHmac, CancellationToken ct);

		bool VerifyCallbackHmac(string data, string receivedHmac);

		Task<Result<PaymentStatusDto>> GetPaymentStatusAsync(Guid paymentId, Guid lawyerId, CancellationToken ct);

		Task<Result<PaymentStatusDto>> GetPaymentStatusByTransactionIdAsync(string transactionId, Guid lawyerId, CancellationToken ct);

		Task<Result<PagedResponse<PaymentHistoryDto>>> GetPaymentHistoryAsync(Guid lawyerId, CancellationToken ct, int pageNumber = 1, int pageSize = 20);
	}
}
