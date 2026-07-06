using Lawyer.Application.Dtos.AiPoints;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;

namespace Lawyer.Application.IServices
{
    public interface IAiPointAccountingService
    {
        int ResolvePointCost(AiStepType stepType);
        Task<Result<AiPointBalanceDto>> GetCurrentBalanceAsync(Guid lawyerId, CancellationToken ct);
        Task<Result<AiPointBalanceDto>> ValidateCanStartAsync(Guid lawyerId, AiStepType stepType, string? runId, string? workflowType, CancellationToken ct);
        Task<Result<AiChargeMetadataDto>> ReserveJobStartAsync(AiJob job, Guid lawyerId, CancellationToken ct);
        Task<Result<AiPointBalanceDto>> ChargeSuccessfulDirectActionAsync(Guid lawyerId, AiStepType stepType, int pointCost, Guid? caseId, string? workflowType, string? workflowRunId, string messageAr, CancellationToken ct);
        Task<Result<AiPointBalanceDto>> RecordNoChargeDirectActionAsync(Guid lawyerId, AiStepType stepType, Guid? caseId, string? workflowType, string? workflowRunId, string messageAr, CancellationToken ct);
        Task<Result<AiChargeMetadataDto>> ChargeSuccessfulJobAsync(AiJob job, Guid lawyerId, CancellationToken ct);
        Task<Result<AiChargeMetadataDto>> MarkNoChargeAsync(AiJob job, Guid lawyerId, AiPointReasonCode reasonCode, string messageAr, CancellationToken ct);
        Task<Result<AiChargeMetadataDto>> RestoreHoldAsync(AiJob job, Guid lawyerId, AiPointReasonCode reasonCode, string messageAr, CancellationToken ct);
        AiChargeMetadataDto BuildChargeMetadata(AiJob job, AiPointBalanceDto? balance = null);
        Task<Result<List<AiPointTransactionDto>>> GetHistoryAsync(Guid lawyerId, DateTime? from, DateTime? to, Guid? caseId, string? workflowType, AiPointTransactionType? transactionType, CancellationToken ct);
    }
}
