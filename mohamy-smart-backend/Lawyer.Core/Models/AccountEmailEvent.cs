using System;

namespace Lawyer.Core.Models
{
    public class AccountEmailEvent : BaseEntity<Guid>
    {
        public Guid UserId { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string BusinessEventId { get; set; } = string.Empty;
        public string RecipientEmail { get; set; } = string.Empty;
        public string SubjectTemplateKey { get; set; } = string.Empty;
        public string DeliveryStatus { get; set; } = "Pending";
        public DateTime? SentAtUtc { get; set; }
        public string? FailureReasonCategory { get; set; }
        public string RetryState { get; set; } = "not_attempted";
        public string TriggeredBy { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }
    }
}
