using Lawyer.Core.Enum;

namespace Lawyer.Core.Models
{
    public class AiPointTransaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid LawyerId { get; set; }
        public Guid LawyerSubscriptionId { get; set; }
        public Guid? AiJobId { get; set; }
        public Guid? CaseId { get; set; }
        public string? WorkflowType { get; set; }
        public string? WorkflowRunId { get; set; }
        public AiStepType StepType { get; set; }
        public AiPointTransactionType TransactionType { get; set; }
        public int Points { get; set; }
        public int BalanceBefore { get; set; }
        public int BalanceAfter { get; set; }
        public AiPointReasonCode ReasonCode { get; set; }
        public string MessageAr { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public LawyerSubscription LawyerSubscription { get; set; } = null!;
        public AiJob? AiJob { get; set; }
    }
}
