using System;

namespace Lawyer.Core.Models
{
    public class PowerOfAttorney : BaseEntity<Guid>
    {
        public Guid ClientId { get; set; }
        public Client Client { get; set; } = null!;

        public string Number { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string IssuingAuthority { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }

        public bool IsCanceled { get; set; }
        public DateTime? CancellationDate { get; set; }
    }
}
