using Lawyer.Application.IServices;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Lawyer.Core.Setting;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, IUnitOfWork unitOfWork, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(
            string toAddress,
            string subject,
            string body,
            string eventType,
            string relatedBusinessId,
            Guid? userId = null,
            string? subjectTemplateKey = null,
            string? triggeredBy = null,
            CancellationToken cancellationToken = default)
        {
            // Check if email is configured
            if (string.IsNullOrWhiteSpace(_settings.SmtpHost) ||
                _settings.SmtpHost.StartsWith("TODO", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Email not configured. Skipping email to {To} for event {EventType}", toAddress, eventType);
                await RecordFailureAsync(toAddress, eventType, relatedBusinessId, "SMTP not configured", cancellationToken);
                return false;
            }

            try
            {
                var existingSuccessfulEvent = await _unitOfWork.Repository<AccountEmailEvent>()
                    .FirstOrDefaultAsync(
                        x => x.EventType == eventType &&
                             x.BusinessEventId == relatedBusinessId &&
                             x.RecipientEmail == toAddress &&
                             x.DeliveryStatus == "Sent",
                        cancellationToken);

                if (existingSuccessfulEvent != null)
                {
                    _logger.LogInformation("Skipping duplicate email for event {EventType} and business id {BusinessId}", eventType, relatedBusinessId);
                    return true;
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
                message.To.Add(MailboxAddress.Parse(toAddress));
                message.Subject = subject;
                message.Body = new TextPart("html") { Text = body };

                using var client = new SmtpClient();
                await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, _settings.UseSsl, cancellationToken);

                if (!string.IsNullOrWhiteSpace(_settings.SmtpUser))
                {
                    await client.AuthenticateAsync(_settings.SmtpUser, _settings.SmtpPassword, cancellationToken);
                }

                await client.SendAsync(message, cancellationToken);
                await client.DisconnectAsync(true, cancellationToken);

                if (userId.HasValue)
                {
                    await RecordEventAsync(
                        userId.Value,
                        toAddress,
                        eventType,
                        relatedBusinessId,
                        subjectTemplateKey ?? eventType,
                        "Sent",
                        null,
                        triggeredBy ?? "system",
                        cancellationToken);
                }

                _logger.LogInformation("Email sent to {To} for event {EventType}", toAddress, eventType);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To} for event {EventType}", toAddress, eventType);
                if (userId.HasValue)
                {
                    await RecordEventAsync(
                        userId.Value,
                        toAddress,
                        eventType,
                        relatedBusinessId,
                        subjectTemplateKey ?? eventType,
                        "Failed",
                        ex.Message,
                        triggeredBy ?? "system",
                        cancellationToken);
                }
                await RecordFailureAsync(toAddress, eventType, relatedBusinessId, ex.Message, cancellationToken);
                return false;
            }
        }

        private async Task RecordEventAsync(
            Guid userId,
            string recipientAddress,
            string eventType,
            string relatedBusinessId,
            string subjectTemplateKey,
            string deliveryStatus,
            string? failureReason,
            string triggeredBy,
            CancellationToken cancellationToken)
        {
            try
            {
                var repository = _unitOfWork.Repository<AccountEmailEvent>();
                var existing = await repository.FirstOrDefaultAsync(
                    x => x.EventType == eventType &&
                         x.BusinessEventId == relatedBusinessId &&
                         x.RecipientEmail == recipientAddress,
                    cancellationToken);

                if (existing == null)
                {
                    existing = new AccountEmailEvent
                    {
                        UserId = userId,
                        EventType = eventType,
                        BusinessEventId = relatedBusinessId,
                        RecipientEmail = recipientAddress,
                        SubjectTemplateKey = subjectTemplateKey,
                        TriggeredBy = triggeredBy,
                    };
                    await repository.AddAsync(existing);
                }

                existing.DeliveryStatus = deliveryStatus;
                existing.SentAtUtc = deliveryStatus == "Sent" ? DateTime.UtcNow : existing.SentAtUtc;
                existing.FailureReasonCategory = failureReason;
                existing.RetryState = deliveryStatus == "Sent" ? "completed" : existing.RetryState;

                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to record account email event for {RecipientAddress}", recipientAddress);
            }
        }

        private async Task RecordFailureAsync(
            string recipientAddress,
            string eventType,
            string relatedBusinessId,
            string failureReason,
            CancellationToken cancellationToken)
        {
            try
            {
                var failure = new EmailDeliveryFailure
                {
                    EventType = eventType,
                    RelatedBusinessId = relatedBusinessId,
                    RecipientAddress = recipientAddress,
                    FailureReason = failureReason.Length > 2000 ? failureReason[..2000] : failureReason,
                    FailedAt = DateTime.UtcNow,
                    RetryState = "not_attempted",
                };

                var emailFailureRepository = _unitOfWork.Repository<EmailDeliveryFailure>();
                await emailFailureRepository.AddAsync(failure);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Email delivery failure recorded for {RecipientAddress} ({EventType})", recipientAddress, eventType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to record email delivery failure for {RecipientAddress}", recipientAddress);
            }
        }
    }
}
