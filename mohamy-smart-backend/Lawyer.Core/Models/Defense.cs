using Lawyer.Core.Enum;
using System;

namespace Lawyer.Core.Models
{
    public class Defense : BaseEntity<Guid>
    {
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;

        public DefenseType Type { get; set; }
        public string DefenseTitle { get; set; } = string.Empty;
        public string BasisFromCase { get; set; } = string.Empty;
        public string Scope { get; set; } = string.Empty;
        public DefenseStrength Strength { get; set; }
        public string? AnalysisJson { get; set; }
    }
}
