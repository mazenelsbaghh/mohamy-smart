using Lawyer.Application.Dtos.AdminComplaint;
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
    public class AdminComplaintController : AppControllerBase
    {
        private readonly IAdminComplaintService _service;

        public AdminComplaintController(IAdminComplaintService service)
        {
            _service = service;
        }

        private string GetLawyerId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

        [HttpPost("{caseId}/start-new")]
        public async Task<IActionResult> StartNewRun(Guid caseId, CancellationToken ct)
        {
            var result = await _service.StartNewRunAsync(caseId, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("{caseId}/start-from-snapshot/{snapshotId:int}")]
        public async Task<IActionResult> StartFromSnapshot(Guid caseId, int snapshotId, CancellationToken ct)
        {
            var result = await _service.StartFromSnapshotAsync(caseId, snapshotId, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpGet("case/{caseId}/resume")]
        public async Task<IActionResult> ResumeCurrentRun(Guid caseId, CancellationToken ct)
        {
            var result = await _service.ResumeCurrentRunAsync(caseId, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPost]
        public async Task<IActionResult> StartWorkflow([FromBody] StartComplaintWorkflowRequest request, CancellationToken ct)
        {
            var result = await _service.StartWorkflowAsync(request, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkflow(int id, CancellationToken ct)
        {
            var result = await _service.GetWorkflowAsync(id, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpGet("case/{caseId}")]
        public async Task<IActionResult> GetWorkflowsByCase(Guid caseId, CancellationToken ct)
        {
            var result = await _service.GetWorkflowsByCaseAsync(caseId, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("steps/run")]
        public async Task<IActionResult> RunStep([FromBody] Lawyer.Application.Services.Workflows.RunWorkflowStepRequest request, CancellationToken ct)
        {
            if (request.WorkflowId == null) return CreateResponse(Lawyer.Core.Exceptions.Result<object>.Error(System.Net.HttpStatusCode.BadRequest, "workflowId is required."));
            var result = await _service.RunStepAsync(request.WorkflowId.Value, request.StepNumber, new RunComplaintStepRequest(){ Input = request.Input }, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPut("{id}/step/{stepNumber}")]
        public async Task<IActionResult> SaveEditedStep(int id, int stepNumber, [FromBody] SaveComplaintStepRequest request, CancellationToken ct)
        {
            var result = await _service.SaveEditedStepAsync(id, stepNumber, request.EditedOutputJson, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPatch("{id}/step/{stepNumber}/auto-save")]
        public async Task<IActionResult> AutoSaveStepDraft(int id, int stepNumber, [FromBody] Lawyer.Application.Dtos.Workflows.SaveWorkflowDraftRequest request, CancellationToken ct)
        {
            var result = await _service.SaveDraftAsync(id, request, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("abandon/{id}")]
        public async Task<IActionResult> AbandonWorkflow(int id, CancellationToken ct)
        {
            var result = await _service.AbandonWorkflowAsync(id, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("{id}/advance-stage")]
        public async Task<IActionResult> AdvanceStage(int id, [FromBody] Lawyer.Application.Dtos.Workflows.TransitionStageRequestDto request, CancellationToken ct)
        {
            var result = await _service.AdvanceStageAsync(Guid.Empty, id, request.FromStep, request.ToStep, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("{id}/recover-conflict")]
        public async Task<IActionResult> RecoverConflict(int id, [FromBody] Lawyer.Application.Dtos.Workflows.RecoverConflictRequest request, CancellationToken ct)
        {
            var result = await _service.RecoverConflictAsync(Guid.Empty, id, request.StepNumber, GetLawyerId(), ct);
            return CreateResponse(result);
        }
    }
}
