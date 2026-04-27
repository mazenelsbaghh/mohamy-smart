using Lawyer.Application.Services;
using Lawyer.Core.Exceptions;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface IWorkflowSnapshotService
    {
        Task<Result<WorkflowSnapshotDto>> CreateSnapshotAsync(Guid caseId, string lawyerId, string workflowType, string outputsJson, int currentStep, string? label, CancellationToken ct);
        Task<Result<List<WorkflowSnapshotDto>>> GetSnapshotsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct);
        Task<Result<WorkflowSnapshotDto>> GetSnapshotByIdAsync(int id, string lawyerId, CancellationToken ct);
        Task<Result<bool>> DeleteSnapshotAsync(int id, string lawyerId, CancellationToken ct);
        Task<Result<bool>> UpdateLabelAsync(int id, string lawyerId, string label, CancellationToken ct);
    }
}
