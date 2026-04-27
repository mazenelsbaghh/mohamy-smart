namespace Lawyer.Core.Models
{
    public class LawSuitRequest : BaseEntity<Guid>
    {
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;

        public LawSuitRequestType RequestType { get; set; }
        public int RequestNumber { get; set; }
        public string RequestText { get; set; } = string.Empty;
        public string LegalReference { get; set; } = string.Empty;
    }

    public enum LawSuitRequestType
    {
        Principal = 1,
        Subsidiary = 2,
        Procedural = 3
    }
}
