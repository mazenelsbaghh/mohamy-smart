namespace Lawyer.Core.Models
{
    public class LawSuitLegalText : BaseEntity<Guid>
    {
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;

        public string LawName { get; set; } = string.Empty;
        public string ArticleNumber { get; set; } = string.Empty;
        public string ArticleText { get; set; } = string.Empty;
        public string ApplicationNotes { get; set; } = string.Empty;
    }
}
