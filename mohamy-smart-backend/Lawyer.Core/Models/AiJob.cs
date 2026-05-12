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
        public string? RunId { get; set; }
        public string? WorkflowType { get; set; }
        public int? StepNumber { get; set; }
        public string? ErrorCode { get; set; }
        public int PointCost { get; set; } = 1;
        public AiChargeState ChargeState { get; set; } = AiChargeState.Pending;
        public int ChargedPoints { get; set; }
        public string? ChargeReason { get; set; }
        public DateTime? ChargedAt { get; set; }
        public bool IsRepeatAttempt { get; set; }
        public AiRepeatIntent? RepeatIntent { get; set; }
        public DateTime? ConfirmationAcceptedAt { get; set; }
    }
}
