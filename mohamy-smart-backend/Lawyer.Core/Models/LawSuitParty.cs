namespace Lawyer.Core.Models
{
    public class LawSuitParty : BaseEntity<Guid>
    {
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string LegalCapacity { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string NationalId { get; set; } = string.Empty;
    }
}
