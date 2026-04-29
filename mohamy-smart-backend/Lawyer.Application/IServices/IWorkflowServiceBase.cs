using Lawyer.Core.Exceptions;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface IWorkflowServiceBase<TDto>
    {
        Task<Result<TDto>> StartWorkflowBaseAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<TDto>> GetWorkflowAsync(int id, string lawyerId, CancellationToken ct);
        Task<Result<List<TDto>>> GetWorkflowsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<object>> SaveEditedStepAsync(int workflowId, int stepNumber, string editedOutputJson, string lawyerId, CancellationToken ct);
        Task<Result<object>> SaveDraftAsync(int workflowId, Dtos.Workflows.SaveWorkflowDraftRequest request, string lawyerId, CancellationToken ct);
        Task<Result<bool>> AbandonWorkflowAsync(int id, string lawyerId, CancellationToken ct);

        Task<Result<Dtos.Workflows.WorkflowStartNewResponseDto>> StartNewRunAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<TDto>> ResumeCurrentRunAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<TDto>> AdvanceStageAsync(Guid caseId, int workflowId, int fromStep, int toStep, string lawyerId, CancellationToken ct);
        Task<Result<Dtos.Workflows.WorkflowStageConflictResponseDto>> RecoverConflictAsync(Guid caseId, int workflowId, int stepNumber, string lawyerId, CancellationToken ct);
    }
}
