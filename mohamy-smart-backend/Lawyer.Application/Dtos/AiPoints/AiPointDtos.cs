using Lawyer.Core.Enum;

namespace Lawyer.Application.Dtos.AiPoints
{
    public record AiPointBalanceDto(
        int Limit,
        int Used,
        int Held,
        int Available,
        bool SubscriptionActive,
        string MessageAr
    );

    public record AiChargeMetadataDto(
        int PointCost,
        AiChargeState ChargeState,
        int ChargedPoints,
        string? ChargeReason,
        DateTime? ChargedAt,
        bool IsRepeatAttempt,
        AiRepeatIntent? RepeatKind,
        bool RequiresConfirmation,
        AiPointBalanceDto? Balance
    );

    public record AiPointTransactionDto(
        Guid Id,
        DateTime CreatedAt,
        Guid? CaseId,
        string? WorkflowType,
        string? WorkflowRunId,
        AiStepType StepType,
        AiPointTransactionType TransactionType,
        int Points,
        int BalanceBefore,
        int BalanceAfter,
        AiPointReasonCode ReasonCode,
        string MessageAr
    );
}
