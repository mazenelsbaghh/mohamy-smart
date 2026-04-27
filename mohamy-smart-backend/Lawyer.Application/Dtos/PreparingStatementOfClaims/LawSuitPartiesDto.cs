namespace Lawyer.Application.Dtos.PreparingStatementOfClaims
{
    public class LawSuitPartiesRequestDto
    {
        public Guid CaseId { get; set; }
    }

    public class PartyDto
    {
        public Guid? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;

        public string LegalCapacity { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string NationalId { get; set; } = string.Empty;
    }

    public class LawSuitPartiesResponseDto
    {
        public Guid CaseId { get; set; }
        public List<PartyDto> Parties { get; set; } = new();
    }
}
