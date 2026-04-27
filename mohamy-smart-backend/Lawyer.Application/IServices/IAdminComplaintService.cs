using Lawyer.Application.Dtos.AdminComplaint;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public interface IAdminComplaintService
    {
        Task<Result<AdminComplaintWorkflowDto>> StartWorkflowAsync(StartComplaintWorkflowRequest request, string lawyerId, CancellationToken ct);
        Task<Result<AdminComplaintWorkflowDto>> GetWorkflowAsync(int id, string lawyerId, CancellationToken ct);
        Task<Result<List<AdminComplaintWorkflowDto>>> GetWorkflowsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunComplaintStepRequest request, string lawyerId, CancellationToken ct);
        Task<Result<object>> SaveEditedStepAsync(int workflowId, int stepNumber, string editedOutputJson, string lawyerId, CancellationToken ct);
        Task<Result<object>> SaveDraftAsync(int workflowId, Lawyer.Application.Dtos.Workflows.SaveWorkflowDraftRequest request, string lawyerId, CancellationToken ct);
        Task<Result<bool>> AbandonWorkflowAsync(int id, string lawyerId, CancellationToken ct);
    }
}
