using System;
using Lawyer.Core.Enum;

namespace Lawyer.Core.Models
{
    public abstract class WorkflowBase
    {
        public int Id { get; set; }
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;
        public string LawyerId { get; set; } = string.Empty;
        public int CurrentStep { get; set; } = 1;
        public WorkflowStatus Status { get; set; } = WorkflowStatus.InProgress;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [System.ComponentModel.DataAnnotations.Timestamp]
        public byte[] RowVersion { get; set; } = null!;

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public abstract int TotalSteps { get; }
        
        public abstract string? GetStepOutput(int stepNumber);
        public abstract void SetStepOutput(int stepNumber, string? json);
    }
}
