namespace Lawyer.Core.Models
{
    public class LawSuitSubject : BaseEntity<Guid>
    {
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;

        public string SubjectTitle { get; set; } = string.Empty;
        public string SubjectFullText { get; set; } = string.Empty;
    }
}
