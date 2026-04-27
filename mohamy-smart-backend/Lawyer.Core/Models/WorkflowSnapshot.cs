using System;
using System.ComponentModel.DataAnnotations;

namespace Lawyer.Core.Models
{
    public class WorkflowSnapshot
    {
        public int Id { get; set; }
        public Guid CaseId { get; set; }

        [Required]
        [MaxLength(450)]
        public string LawyerId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string WorkflowType { get; set; } = string.Empty;

        /// <summary>
        /// JSON blob containing all step outputs for this snapshot.
        /// </summary>
        [Required]
        public string OutputsJson { get; set; } = "{}";

        public int CurrentStep { get; set; }

        [MaxLength(200)]
        public string? Label { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Case Case { get; set; } = null!;
    }
}
