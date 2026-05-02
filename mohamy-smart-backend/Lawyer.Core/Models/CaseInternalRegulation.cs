using System;

namespace Lawyer.Core.Models
{
    public class CaseInternalRegulation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;
        public Guid InternalRegulationId { get; set; }
        public InternalRegulation InternalRegulation { get; set; } = null!;
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public Guid CreatedByUserId { get; set; }
    }
}
