namespace Lawyer.Application.Dtos.PreparingStatementOfClaims
{
    public class LawSuitFactsRequestDto
    {
        public Guid CaseId { get; set; }
        public string? Facts { get; set; }
        public List<string> SelectedFacts { get; set; } = new();
    }

    public class LawSuitFactsResponseDto
    {
        public Guid CaseId { get; set; }

        public string FactsNarrative { get; set; } = string.Empty;
    }
}
