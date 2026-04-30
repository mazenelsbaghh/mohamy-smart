using Lawyer.Application.Dtos.RulingAnalysis;
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
    public class RulingAnalysisController : AppControllerBase
    {
        private readonly ILogger<RulingAnalysisController> _logger;
        private readonly IRulingAnalysisService _service;

        private string GetLawyerId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

        public RulingAnalysisController(
            ILogger<RulingAnalysisController> logger,
            IRulingAnalysisService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpPost("{caseId}/start-new")]
        public async Task<IActionResult> StartNewRun(Guid caseId, CancellationToken ct)
        {
            _logger.LogInformation("StartNewRun for RulingAnalysis Case {CaseId}", caseId);
            var result = await _service.StartNewRunAsync(caseId, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("{caseId}/start-from-snapshot/{snapshotId:int}")]
        public async Task<IActionResult> StartFromSnapshot(Guid caseId, int snapshotId, CancellationToken ct)
        {
            _logger.LogInformation("StartFromSnapshot for RulingAnalysis Case {CaseId}, Snapshot {SnapshotId}", caseId, snapshotId);
            var result = await _service.StartFromSnapshotAsync(caseId, snapshotId, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpGet("case/{caseId}/resume")]
        public async Task<IActionResult> ResumeCurrentRun(Guid caseId, CancellationToken ct)
        {
            _logger.LogInformation("ResumeCurrentRun for RulingAnalysis Case {CaseId}", caseId);
            var result = await _service.ResumeCurrentRunAsync(caseId, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartWorkflow(
            [FromBody] StartRulingWorkflowRequest dto,
            CancellationToken ct)
        {
            _logger.LogInformation("Starting RulingAnalysis workflow for Case {CaseId}", dto.CaseId);
            var result = await _service.StartWorkflowAsync(dto, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetWorkflow(int id, CancellationToken ct)
        {
            _logger.LogInformation("Getting RulingAnalysis workflow {Id}", id);
            var result = await _service.GetWorkflowAsync(id, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpGet("case/{caseId:guid}")]
        public async Task<IActionResult> GetWorkflowsByCase(Guid caseId, CancellationToken ct)
        {
            _logger.LogInformation("Getting RulingAnalysis workflows for Case {CaseId}", caseId);
            var result = await _service.GetWorkflowsByCaseAsync(caseId, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("steps/run")]
        public async Task<IActionResult> RunStep(
            [FromBody] Lawyer.Application.Services.Workflows.RunWorkflowStepRequest dto,
            CancellationToken ct)
        {
            if (dto.WorkflowId == null) return CreateResponse(Lawyer.Core.Exceptions.Result<object>.Error(System.Net.HttpStatusCode.BadRequest, "workflowId is required."));
            _logger.LogInformation("Running RulingAnalysis step {Step} for workflow {WorkflowId}", dto.StepNumber, dto.WorkflowId);
            var result = await _service.RunStepAsync(dto.WorkflowId.Value, dto.StepNumber, new RunRulingStepRequest(){ Input = dto.Input }, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPut("{workflowId:int}/steps/{stepNumber:int}/save")]
        public async Task<IActionResult> SaveEditedStep(
            int workflowId, int stepNumber,
            [FromBody] SaveRulingStepRequest dto,
            CancellationToken ct)
        {
            _logger.LogInformation("Saving RulingAnalysis step {Step} for workflow {WorkflowId}", stepNumber, workflowId);
            var result = await _service.SaveEditedStepAsync(workflowId, stepNumber, dto.EditedOutputJson, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPatch("{workflowId:int}/step/{stepNumber:int}/auto-save")]
        public async Task<IActionResult> AutoSaveStepDraft(
            int workflowId, int stepNumber,
            [FromBody] Lawyer.Application.Dtos.Workflows.SaveWorkflowDraftRequest dto,
            CancellationToken ct)
        {
            var result = await _service.SaveDraftAsync(workflowId, dto, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("abandon/{id}")]
        public async Task<IActionResult> AbandonWorkflow(int id, CancellationToken ct)
        {
            _logger.LogInformation("Abandoning RulingAnalysis workflow {Id}", id);
            var result = await _service.AbandonWorkflowAsync(id, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("{id}/advance-stage")]
        public async Task<IActionResult> AdvanceStage(int id, [FromBody] Application.Dtos.Workflows.TransitionStageRequestDto request, CancellationToken ct)
        {
            var result = await _service.AdvanceStageAsync(Guid.Empty, id, request.FromStep, request.ToStep, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("{id}/recover-conflict")]
        public async Task<IActionResult> RecoverConflict(int id, [FromBody] Application.Dtos.Workflows.RecoverConflictRequest request, CancellationToken ct)
        {
            var result = await _service.RecoverConflictAsync(Guid.Empty, id, request.StepNumber, GetLawyerId(), ct);
            return CreateResponse(result);
        }
    }
}
