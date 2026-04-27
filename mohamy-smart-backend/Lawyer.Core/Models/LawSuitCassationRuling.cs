namespace Lawyer.Core.Models
{
    public class LawSuitCassationRuling : BaseEntity<Guid>
    {
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;

        public string Court { get; set; } = string.Empty;
        public string AppealNumber { get; set; } = string.Empty;
        public string JudicialYear { get; set; } = string.Empty;
        public string SessionDate { get; set; } = string.Empty;
        public string RulingText { get; set; } = string.Empty;
        public string ApplicationNotes { get; set; } = string.Empty;
    }
}
