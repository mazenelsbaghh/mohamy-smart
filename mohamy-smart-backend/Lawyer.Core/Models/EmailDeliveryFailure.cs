using System;

namespace Lawyer.Core.Models
{
    public class EmailDeliveryFailure : BaseEntity<Guid>
    {
        /// <summary>
        /// PasswordResetFallback or SubscriptionConfirmation
        /// </summary>
        public string EventType { get; set; } = null!;

        /// <summary>
        /// Stable identifier linking to the business event (e.g. userId, subscriptionId).
        /// </summary>
        public string RelatedBusinessId { get; set; } = null!;

        public string RecipientAddress { get; set; } = null!;

        public string FailureReason { get; set; } = null!;

        public DateTime FailedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// not_attempted or manual_follow_up
        /// </summary>
        public string RetryState { get; set; } = "not_attempted";
    }
}
