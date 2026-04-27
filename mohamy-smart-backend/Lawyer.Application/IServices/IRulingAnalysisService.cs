using Lawyer.Application.Dtos.RulingAnalysis;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public interface IRulingAnalysisService
    {
        Task<Result<RulingAnalysisWorkflowDto>> StartWorkflowAsync(StartRulingWorkflowRequest request, string lawyerId, CancellationToken ct);
        Task<Result<RulingAnalysisWorkflowDto>> GetWorkflowAsync(int id, string lawyerId, CancellationToken ct);
        Task<Result<List<RulingAnalysisWorkflowDto>>> GetWorkflowsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunRulingStepRequest request, string lawyerId, CancellationToken ct);
        Task<Result<object>> SaveEditedStepAsync(int workflowId, int stepNumber, string editedOutputJson, string lawyerId, CancellationToken ct);
        Task<Result<object>> SaveDraftAsync(int workflowId, Lawyer.Application.Dtos.Workflows.SaveWorkflowDraftRequest request, string lawyerId, CancellationToken ct);
        Task<Result<bool>> AbandonWorkflowAsync(int id, string lawyerId, CancellationToken ct);
    }
}
