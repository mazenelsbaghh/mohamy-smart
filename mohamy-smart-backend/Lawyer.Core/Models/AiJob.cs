using Lawyer.Core.Enum;

namespace Lawyer.Core.Models
{
    public class AiJob
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CaseId { get; set; }
        public Case Case { get; set; } = null!;
        public AiStepType StepType { get; set; }
        public AiJobStatus Status { get; set; } = AiJobStatus.Queued;
        public string? HangfireJobId { get; set; }
        public string? ResultJson { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
