using System;
using Lawyer.Core.Enums;

namespace Lawyer.Core.Models
{
	public class Otp : BaseEntity<int>
	{
		public string Code { get; set; } = string.Empty;

		public string CodeSalt { get; set; } = string.Empty;

		public DateTime ExpirationDate { get; set; }

		public OtpType Type { get; set; } = OtpType.forgetPassword;

		public string DeliveryChannel { get; set; } = "Sms";

		public string MaskedDestination { get; set; } = string.Empty;

		public int AttemptCount { get; set; }

		public int MaxAttempts { get; set; } = 5;

		public DateTime? ConsumedAtUtc { get; set; }

		public DateTime? InvalidatedAtUtc { get; set; }

		public bool IsVerified { get; set; }

		public string? FailureReason { get; set; }

		public Guid UserId { get; set; }

		public ApplicationUser User { get; set; } = null!;
	}
}
