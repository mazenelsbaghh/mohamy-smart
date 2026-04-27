using System;

namespace Lawyer.Core.Models
{
	public class ClientFile : BaseEntity<Guid>
	{
		public string FileName { get; set; } = string.Empty;
		public string FilePath { get; set; } = string.Empty;
		public string ContentType { get; set; } = string.Empty;
		public long FileSize { get; set; }

		public Guid ClientId { get; set; }
		public Client Client { get; set; } = null!;
	}
}
