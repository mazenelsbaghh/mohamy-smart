using Lawyer.Application.Dtos.LegalWarning;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public interface ILegalWarningService
    {
        Task<Result<LegalWarningWorkflowDto>> StartWorkflowAsync(StartLegalWarningRequest request, string lawyerId, CancellationToken ct);
        Task<Result<LegalWarningWorkflowDto>> GetWorkflowAsync(int id, string lawyerId, CancellationToken ct);
        Task<Result<List<LegalWarningWorkflowDto>>> GetWorkflowsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunWarningStepRequest request, string lawyerId, CancellationToken ct);
        Task<Result<object>> SaveEditedStepAsync(int workflowId, int stepNumber, string editedOutputJson, string lawyerId, CancellationToken ct);
        Task<Result<object>> SaveDraftAsync(int workflowId, Lawyer.Application.Dtos.Workflows.SaveWorkflowDraftRequest request, string lawyerId, CancellationToken ct);
        Task<Result<bool>> AbandonWorkflowAsync(int id, string lawyerId, CancellationToken ct);
        Task<Result<Dtos.Workflows.WorkflowStartNewResponseDto>> StartNewRunAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<LegalWarningWorkflowDto>> ResumeCurrentRunAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<LegalWarningWorkflowDto>> AdvanceStageAsync(Guid caseId, int workflowId, int fromStep, int toStep, string lawyerId, CancellationToken ct);
        Task<Result<Dtos.Workflows.WorkflowStageConflictResponseDto>> RecoverConflictAsync(Guid caseId, int workflowId, int stepNumber, string lawyerId, CancellationToken ct);
    }
}
