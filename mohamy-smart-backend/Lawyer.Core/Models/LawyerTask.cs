using System;

namespace Lawyer.Core.Models
{
	public class LawyerTask : BaseEntity<Guid>
	{
		public string Title { get; set; } = string.Empty;
		public DateTime Date { get; set; }
		public TimeSpan? Time { get; set; }
		public string? Notes { get; set; }

		public Guid LawyerId { get; set; }
		public Lawyer Lawyer { get; set; } = null!;
	}
}
