namespace Lawyer.Application.Dtos.PreparingStatementOfClaims
{
    public class LawSuitCaseTypeRequestDto
    {
        public Guid CaseId { get; set; }
        public string? Facts { get; set; }
        public List<string> SelectedFacts { get; set; } = new();
    }

    public class LawSuitCaseTypeResponseDto
    {
        public Guid CaseId { get; set; }

        public string CaseMainType { get; set; } = string.Empty;

        public string CaseSubType { get; set; } = string.Empty;

        public string CourtType { get; set; } = string.Empty;

        public string ProceduralNature { get; set; } = string.Empty;

        public string IsUrgentOrSummary { get; set; } = string.Empty;

        public string JustificationSummary { get; set; } = string.Empty;
    }
}
