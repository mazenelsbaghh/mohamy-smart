using Lawyer.Application.Dtos.AiJobs;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public interface IAiJobService
    {
        Task<Result<List<AiJobStatusDto>>> GetAllByCaseAsync(Guid caseId, string userId, CancellationToken ct);

        Task<Result<AiJobStatusDto>> GetByCaseAndStepAsync(Guid caseId, AiStepType step, string userId, CancellationToken ct);

        Task<Result<AiJobStatusDto>> SubmitAsync(Guid caseId, SubmitAiJobDto dto, string userId, CancellationToken ct);

        Task<Result<AiJobStatusDto>> RetryAsync(Guid caseId, AiStepType step, SubmitAiJobDto dto, string userId, CancellationToken ct);

        Task<Result<AiJobStatusDto>> CancelAsync(Guid caseId, AiStepType step, string userId, CancellationToken ct);

        Task<Result<AiJobStatusDto?>> GetActiveJobByRunAsync(Guid caseId, string runId, string workflowType, int stepNumber, string userId, CancellationToken ct);
        Task<Result<bool>> IgnoreStaleCompletionAsync(Guid jobId, string activeRunId, string userId, CancellationToken ct);
        Task<Result<AiJobStatusDto>> MarkConflictAsync(Guid jobId, string errorCode, string conflictMessage, string userId, CancellationToken ct);
    }
}
