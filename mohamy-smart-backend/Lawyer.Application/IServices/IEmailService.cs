using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface IEmailService
    {
        /// <summary>
        /// Sends an email. On failure, records an EmailDeliveryFailure entry.
        /// </summary>
        /// <param name="toAddress">Recipient email address.</param>
        /// <param name="subject">Email subject.</param>
        /// <param name="body">Email body (HTML supported).</param>
        /// <param name="eventType">PasswordResetFallback or SubscriptionConfirmation.</param>
        /// <param name="relatedBusinessId">Stable identifier linking to the business event.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>True if sent successfully, false if failed (failure is recorded).</returns>
        Task<bool> SendEmailAsync(
            string toAddress,
            string subject,
            string body,
            string eventType,
            string relatedBusinessId,
            Guid? userId = null,
            string? subjectTemplateKey = null,
            string? triggeredBy = null,
            CancellationToken cancellationToken = default);
    }
}
