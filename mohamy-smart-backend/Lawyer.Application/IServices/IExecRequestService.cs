using Lawyer.Application.Dtos.ExecRequest;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public interface IExecRequestService
    {
        Task<Result<ExecRequestWorkflowDto>> StartWorkflowAsync(StartExecRequestRequest request, string lawyerId, CancellationToken ct);
        Task<Result<ExecRequestWorkflowDto>> GetWorkflowAsync(int id, string lawyerId, CancellationToken ct);
        Task<Result<List<ExecRequestWorkflowDto>>> GetWorkflowsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunExecStepRequest request, string lawyerId, CancellationToken ct);
        Task<Result<object>> SaveEditedStepAsync(int workflowId, int stepNumber, string editedOutputJson, string lawyerId, CancellationToken ct);
        Task<Result<object>> SaveDraftAsync(int workflowId, Lawyer.Application.Dtos.Workflows.SaveWorkflowDraftRequest request, string lawyerId, CancellationToken ct);
        Task<Result<bool>> AbandonWorkflowAsync(int id, string lawyerId, CancellationToken ct);
        Task<Result<Dtos.Workflows.WorkflowStartNewResponseDto>> StartNewRunAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<Dtos.Workflows.WorkflowStartNewResponseDto>> StartFromSnapshotAsync(Guid caseId, int snapshotId, string lawyerId, CancellationToken ct);
        Task<Result<ExecRequestWorkflowDto>> ResumeCurrentRunAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<ExecRequestWorkflowDto>> AdvanceStageAsync(Guid caseId, int workflowId, int fromStep, int toStep, string lawyerId, CancellationToken ct);
        Task<Result<Dtos.Workflows.WorkflowStageConflictResponseDto>> RecoverConflictAsync(Guid caseId, int workflowId, int stepNumber, string lawyerId, CancellationToken ct);
    }
}
