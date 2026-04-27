using System;
using System.ComponentModel.DataAnnotations;

namespace Lawyer.Core.Models
{
	public class AccessToken : BaseEntity<Guid>
	{
		[MaxLength(100)]
		public string TokenId { get; set; } = null!; // JWT "jti" claim

		[Required]
		public Guid UserId { get; set; }

		public bool IsRevoked { get; set; } = false;
		public DateTime? RevokedAt { get; set; }
		public string? RevokedReason { get; set; }
		public DateTime ExpiresAt { get; set; }

		public ApplicationUser User { get; set; } = null!;
	}
}
