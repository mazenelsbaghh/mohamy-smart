using System;
using System.ComponentModel.DataAnnotations;
using Lawyer.Core.Enum;

namespace Lawyer.Application.Dtos.ProcessServerPaper
{
    public class CreateProcessServerPaperDto
    {
        [Required]
        public Guid ClientId { get; set; }
        public Guid? CaseId { get; set; }
        
        [Required]
        public ProcessServerPaperType PaperType { get; set; }
        public string? OtherPaperType { get; set; }
        public string? CustomPaperTypeTitle { get; set; }
        
        [Required]
        public string TargetName { get; set; } = string.Empty;
        
        [Required]
        public ProcessServerPaperStatus Status { get; set; }
        
        public string? Notes { get; set; }
        public DateTime? ServedDate { get; set; }
    }
}
