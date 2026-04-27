using System;

namespace Lawyer.Application.Dtos.AdminReport
{
    public class AccountMessagingAuditDto
    {
        public int TotalOtpIssued { get; set; }
        public int TotalOtpVerified { get; set; }
        public int TotalOtpFailed { get; set; }
        public int TotalOtpLockedOut { get; set; }
        public int TotalEmailsSent { get; set; }
        public int TotalEmailsFailed { get; set; }
        public List<OtpAuditEntryDto> RecentOtpEvents { get; set; } = new();
        public List<EmailAuditEntryDto> RecentEmailEvents { get; set; } = new();
    }

    public class OtpAuditEntryDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
        public string DeliveryChannel { get; set; } = string.Empty;
        public string MaskedDestination { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int AttemptCount { get; set; }
        public DateTime IssuedAtUtc { get; set; }
        public DateTime? ConsumedAtUtc { get; set; }
        public string? FailureReason { get; set; }
    }

    public class EmailAuditEntryDto
    {
        public Guid Id { get; set; }
        public string RecipientEmail { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;
        public string DeliveryStatus { get; set; } = string.Empty;
        public DateTime? SentAtUtc { get; set; }
        public string? FailureReasonCategory { get; set; }
        public string TriggeredBy { get; set; } = string.Empty;
    }
}
