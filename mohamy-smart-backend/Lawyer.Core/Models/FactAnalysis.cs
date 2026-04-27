using System;

namespace Lawyer.Core.Models
{
    public class FactAnalysis : BaseEntity<Guid>
    {
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;

        // Stored as JSON
        public string LegalFactsSummaryJson { get; set; } = string.Empty;
        public string DefendantsPositionsJson { get; set; } = string.Empty;
        public string EvidenceMapJson { get; set; } = string.Empty;
        public string LegalAndTechnicalReviewPointsJson { get; set; } = string.Empty;
        public string PotentialLegalCharacterizationJson { get; set; } = string.Empty;
    }
}
