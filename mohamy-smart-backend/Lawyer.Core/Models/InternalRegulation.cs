using System;
using System.Collections.Generic;

namespace Lawyer.Core.Models
{
    public class InternalRegulation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid LawyerId { get; set; }
        public Lawyer Lawyer { get; set; } = null!;
        public string Title { get; set; } = string.Empty;
        public string? RegulationNumber { get; set; }
        public string? IssuingAuthority { get; set; }
        public string? Summary { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAtUtc { get; set; }
        public ICollection<CaseInternalRegulation> CaseLinks { get; set; } = new List<CaseInternalRegulation>();
    }
}
