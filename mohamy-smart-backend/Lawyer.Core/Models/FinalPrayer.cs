using Lawyer.Core.Enum;
using System;

namespace Lawyer.Core.Models
{
    public class FinalPrayer : BaseEntity<Guid>
    {
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;

        public RequestLevel Level { get; set; }
        public string RequestText { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
    }
}
