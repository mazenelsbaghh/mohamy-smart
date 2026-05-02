using System;

namespace Lawyer.Core.Models
{
    public class PowerOfAttorney : BaseEntity<Guid>
    {
        public Guid? ClientId { get; set; }
        public Client? Client { get; set; }

        public Guid? LawyerId { get; set; }
        public Lawyer? Lawyer { get; set; }

        public string Number { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string IssuingAuthority { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        public int SerialNumber { get; set; }
        public string PoAType { get; set; } = "general";

        public bool IsCanceled { get; set; }
        public DateTime? CancellationDate { get; set; }
        public string? CancellationReason { get; set; }
    }
}
