using System;
using Lawyer.Core.Enum;

namespace Lawyer.Application.Dtos.ProcessServerPaper
{
    public class UpdateProcessServerPaperDto
    {
        public ProcessServerPaperType? PaperType { get; set; }
        public string? OtherPaperType { get; set; }
        public string? CustomPaperTypeTitle { get; set; }
        public string TargetName { get; set; } = string.Empty;
        public ProcessServerPaperStatus? Status { get; set; }
        public string? Notes { get; set; }
    }
}
