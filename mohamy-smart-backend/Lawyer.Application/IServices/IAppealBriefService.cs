using Lawyer.Application.Dtos.AppealBrief;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public interface IAppealBriefService : IWorkflowServiceBase<AppealWorkflowDto>
    {
        Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunStepRequest request, string lawyerId, CancellationToken ct);
    }
}
