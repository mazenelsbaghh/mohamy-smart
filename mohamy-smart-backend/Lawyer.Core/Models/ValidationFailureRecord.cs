using System;
using System.ComponentModel.DataAnnotations;

namespace Lawyer.Core.Models
{
    public class ValidationFailureRecord
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string WorkflowType { get; set; } = string.Empty;

        [Required]
        public int StepType { get; set; }

        [Required]
        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(2000)]
        public string ErrorSummary { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? RawOutput { get; set; }

        public Guid? CaseId { get; set; }

        public string? LawyerId { get; set; }
    }
}
