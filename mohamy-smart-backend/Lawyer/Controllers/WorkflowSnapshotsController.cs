using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(Roles = "Lawyer")]
    public class WorkflowSnapshotsController : AppControllerBase
    {
        private readonly IWorkflowSnapshotService _service;

        public WorkflowSnapshotsController(IWorkflowSnapshotService service)
        {
            _service = service;
        }

        private string GetLawyerId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

        /// <summary>
        /// Create a snapshot of workflow outputs before abandoning.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSnapshotRequest request, CancellationToken ct)
        {
            var result = await _service.CreateSnapshotAsync(
                request.CaseId, GetLawyerId(), request.WorkflowType,
                request.OutputsJson, request.CurrentStep, request.Label, ct);
            return CreateResponse(result);
        }

        /// <summary>
        /// Get all snapshots for a case.
        /// </summary>
        [HttpGet("case/{caseId}")]
        public async Task<IActionResult> GetByCase(Guid caseId, CancellationToken ct)
        {
            var result = await _service.GetSnapshotsByCaseAsync(caseId, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        /// <summary>
        /// Get a single snapshot by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var result = await _service.GetSnapshotByIdAsync(id, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        /// <summary>
        /// Update snapshot label.
        /// </summary>
        [HttpPatch("{id}/label")]
        public async Task<IActionResult> UpdateLabel(int id, [FromBody] UpdateLabelRequest request, CancellationToken ct)
        {
            var result = await _service.UpdateLabelAsync(id, GetLawyerId(), request.Label, ct);
            return CreateResponse(result);
        }

        /// <summary>
        /// Delete a snapshot.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var result = await _service.DeleteSnapshotAsync(id, GetLawyerId(), ct);
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
