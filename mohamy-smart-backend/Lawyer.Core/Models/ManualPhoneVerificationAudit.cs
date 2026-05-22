using System;

namespace Lawyer.Core.Models
{
	public class ManualPhoneVerificationAudit : BaseEntity<Guid>
	{
		public Guid UserId { get; set; }
		public string PhoneNumber { get; set; } = string.Empty;
		public Guid VerifiedByAdminId { get; set; }
		public string Reason { get; set; } = string.Empty;

		public ApplicationUser? User { get; set; }
		public ApplicationUser? VerifiedByAdmin { get; set; }
	}
}
