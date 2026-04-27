namespace Lawyer.Application.Dtos.PreparingStatementOfClaims
{
    public class LawSuitCaseTypeRequestDto
    {
        public Guid CaseId { get; set; }
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
