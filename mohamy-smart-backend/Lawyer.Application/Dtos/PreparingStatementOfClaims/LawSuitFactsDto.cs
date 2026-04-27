namespace Lawyer.Application.Dtos.PreparingStatementOfClaims
{
    public class LawSuitFactsRequestDto
    {
        public Guid CaseId { get; set; }
    }

    public class LawSuitFactsResponseDto
    {
        public Guid CaseId { get; set; }

        public string FactsNarrative { get; set; } = string.Empty;
    }
}
