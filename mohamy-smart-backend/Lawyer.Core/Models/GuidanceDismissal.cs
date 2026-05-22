using System;

namespace Lawyer.Core.Models
{
	public class GuidanceDismissal : BaseEntity<Guid>
	{
		public Guid UserId { get; set; }
		public string GuidanceKey { get; set; } = string.Empty;
		public ApplicationUser User { get; set; } = null!;
	}
}
