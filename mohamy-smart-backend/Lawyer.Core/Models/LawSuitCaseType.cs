namespace Lawyer.Core.Models
{
    public class LawSuitCaseType : BaseEntity<Guid>
    {
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;

        public string CaseMainType { get; set; } = string.Empty;
        public string CaseSubType { get; set; } = string.Empty;
        public string CourtType { get; set; } = string.Empty;
        public string ProceduralNature { get; set; } = string.Empty;
        public string IsUrgentOrSummary { get; set; } = string.Empty;
        public string JustificationSummary { get; set; } = string.Empty;
    }
}
