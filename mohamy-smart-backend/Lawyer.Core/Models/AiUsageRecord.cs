using Lawyer.Core.Enum;

using Microsoft.EntityFrameworkCore;

namespace Lawyer.Core.Models
{
    [Index(nameof(CreatedAt))]
    [Index(nameof(Provider))]
    [Index(nameof(LawyerId))]
    public class AiUsageRecord
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid LawyerId { get; set; }
        public Guid? CaseId { get; set; }
        public int? WorkflowId { get; set; }
        public string? WorkflowRunId { get; set; }
        public string? WorkflowType { get; set; }
        public AiStepType AiStepType { get; set; }
        public string ModelIdentifier { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public int InputTokens { get; set; }
        public int OutputTokens { get; set; }
        public int TotalTokens { get; set; }
        public decimal EstimatedCostUsd { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
