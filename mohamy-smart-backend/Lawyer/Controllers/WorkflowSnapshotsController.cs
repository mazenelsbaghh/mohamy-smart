using Lawyer.Application.Common;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(Roles = "Lawyer")]
    public class WorkflowSnapshotsController : AppControllerBase
    {
        private readonly IWorkflowSnapshotService _service;
        private readonly ILawyerIdResolver _lawyerIdResolver;
        private readonly IUserContextProvider _userContextProvider;

        public WorkflowSnapshotsController(
            IWorkflowSnapshotService service,
            ILawyerIdResolver lawyerIdResolver,
            IUserContextProvider userContextProvider)
        {
            _service = service;
            _lawyerIdResolver = lawyerIdResolver;
            _userContextProvider = userContextProvider;
        }

        private async Task<Result<string>> ResolveLawyerIdAsync(CancellationToken ct)
        {
            var userContext = _userContextProvider.GetCurrentContext();
            var resolved = await _lawyerIdResolver.ResolveAsync(userContext, null, ct);
            if (!resolved.Succeeded)
                return Result<string>.Error(resolved.StatusCode, resolved.Message ?? "Unauthorized");
            return Result<string>.Success(resolved.Data.ToString());
        }

        /// <summary>
        /// Create a snapshot of workflow outputs before abandoning.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSnapshotRequest request, CancellationToken ct)
        {
            var lawyerId = await ResolveLawyerIdAsync(ct);
            if (!lawyerId.Succeeded) return CreateResponse(lawyerId);

            var result = await _service.CreateSnapshotAsync(
                request.CaseId, lawyerId.Data, request.WorkflowType,
                request.OutputsJson, request.CurrentStep, request.Label, ct);
            return CreateResponse(result);
        }

        /// <summary>
        /// Get all snapshots for a case.
        /// </summary>
        [HttpGet("case/{caseId}")]
        public async Task<IActionResult> GetByCase(Guid caseId, CancellationToken ct)
        {
            var lawyerId = await ResolveLawyerIdAsync(ct);
            if (!lawyerId.Succeeded) return CreateResponse(lawyerId);

            var result = await _service.GetSnapshotsByCaseAsync(caseId, lawyerId.Data, ct);
            return CreateResponse(result);
        }

        /// <summary>
        /// Get a single snapshot by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var lawyerId = await ResolveLawyerIdAsync(ct);
            if (!lawyerId.Succeeded) return CreateResponse(lawyerId);

            var result = await _service.GetSnapshotByIdAsync(id, lawyerId.Data, ct);
            return CreateResponse(result);
        }

        /// <summary>
        /// Update snapshot label.
        /// </summary>
        [HttpPatch("{id}/label")]
        public async Task<IActionResult> UpdateLabel(int id, [FromBody] UpdateLabelRequest request, CancellationToken ct)
        {
            var lawyerId = await ResolveLawyerIdAsync(ct);
            if (!lawyerId.Succeeded) return CreateResponse(lawyerId);

            var result = await _service.UpdateLabelAsync(id, lawyerId.Data, request.Label, ct);
            return CreateResponse(result);
        }

        /// <summary>
        /// Delete a snapshot.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var lawyerId = await ResolveLawyerIdAsync(ct);
            if (!lawyerId.Succeeded) return CreateResponse(lawyerId);

            var result = await _service.DeleteSnapshotAsync(id, lawyerId.Data, ct);
            return CreateResponse(result);
        }
    }

    public record CreateSnapshotRequest
    {
        public Guid CaseId { get; init; }
        public string WorkflowType { get; init; } = string.Empty;
        public string OutputsJson { get; init; } = "{}";
        public int CurrentStep { get; init; }
        public string? Label { get; init; }
    }

    public record UpdateLabelRequest
    {
        public string Label { get; init; } = string.Empty;
    }
}
