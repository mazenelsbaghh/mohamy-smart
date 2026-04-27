using System;

using Microsoft.EntityFrameworkCore;

namespace Lawyer.Core.Models
{
    [Index(nameof(Created))]
    [Index(nameof(LawyerId))]
    public class Client : BaseEntity<Guid>
	{
		public string ClientName { get; set; } = string.Empty;
		public string PhoneNumber { get; set; } = string.Empty;
		public string Email { get; set; } = string.Empty;
		public string Notes { get; set; } = string.Empty;
		public string Address { get; set; } = string.Empty;
		public string NationalId { get; set; } = string.Empty;
		public string Governorate { get; set; } = string.Empty;

		public Guid LawyerId { get; set; }
		public Lawyer Lawyer { get; set; } = null!;

		public ICollection<Case> Cases { get; set; } = new List<Case>();

		public ICollection<ClientFile> Files { get; set; } = new List<ClientFile>();
		
		public ICollection<DocumentHandoff> DocumentHandoffs { get; set; } = new List<DocumentHandoff>();
		public ICollection<ClientTransaction> ClientTransactions { get; set; } = new List<ClientTransaction>();
		public ICollection<PowerOfAttorney> PowerOfAttorneys { get; set; } = new List<PowerOfAttorney>();
	}
}
