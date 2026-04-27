namespace Lawyer.Core.Models
{
    public class LawSuitFacts : BaseEntity<Guid>
    {
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;

        public string FactsNarrative { get; set; } = string.Empty;
    }
}
