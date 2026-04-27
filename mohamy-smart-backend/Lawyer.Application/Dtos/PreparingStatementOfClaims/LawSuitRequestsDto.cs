namespace Lawyer.Application.Dtos.PreparingStatementOfClaims
{
    public class LawSuitRequestsRequestDto
    {
        public Guid CaseId { get; set; }
    }

    public class LawSuitRequestsResponseDto
    {
        public Guid CaseId { get; set; }

        public List<LawSuitRequestItemDto> PrincipalRequests { get; set; } = new();

        public List<LawSuitRequestItemDto> SubsidiaryRequests { get; set; } = new();

        public List<LawSuitRequestItemDto> ProceduralRequests { get; set; } = new();
    }

    public class LawSuitRequestItemDto
    {
        public Guid Id { get; set; }

        public int RequestNumber { get; set; }

        public string RequestText { get; set; } = string.Empty;

        public string LegalReference { get; set; } = string.Empty;
    }
}
