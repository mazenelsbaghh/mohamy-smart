using Lawyer.Application.Dtos.Workflows;
using Lawyer.Core.Exceptions;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface IDraftAutoSaveService
    {
        Task<Result<object>> SaveDraftAsync(Guid caseId, int stepNumber, SaveWorkflowDraftRequest request, string lawyerId, CancellationToken ct);
    }
}
