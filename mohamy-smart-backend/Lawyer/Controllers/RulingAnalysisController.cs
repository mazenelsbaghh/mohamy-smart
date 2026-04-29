using Lawyer.Application.Dtos.RulingAnalysis;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(Roles = "Lawyer")]
    public class RulingAnalysisController : AppControllerBase
    {
        private readonly ILogger<RulingAnalysisController> _logger;
        private readonly IRulingAnalysisService _service;

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
            var result = await _service.StartNewRunAsync(caseId, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpGet("case/{caseId}/resume")]
        public async Task<IActionResult> ResumeCurrentRun(Guid caseId, CancellationToken ct)
        {
            _logger.LogInformation("ResumeCurrentRun for RulingAnalysis Case {CaseId}", caseId);
            var result = await _service.ResumeCurrentRunAsync(caseId, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartWorkflow(
            [FromBody] StartRulingWorkflowRequest dto,
            CancellationToken ct)
        {
            _logger.LogInformation("Starting RulingAnalysis workflow for Case {CaseId}", dto.CaseId);
            var result = await _service.StartWorkflowAsync(dto, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetWorkflow(int id, CancellationToken ct)
        {
            _logger.LogInformation("Getting RulingAnalysis workflow {Id}", id);
            var result = await _service.GetWorkflowAsync(id, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpGet("case/{caseId:guid}")]
        public async Task<IActionResult> GetWorkflowsByCase(Guid caseId, CancellationToken ct)
        {
            _logger.LogInformation("Getting RulingAnalysis workflows for Case {CaseId}", caseId);
            var result = await _service.GetWorkflowsByCaseAsync(caseId, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpPost("steps/run")]
        public async Task<IActionResult> RunStep(
            [FromBody] Lawyer.Application.Services.Workflows.RunWorkflowStepRequest dto,
            CancellationToken ct)
        {
            if (dto.WorkflowId == null) return CreateResponse(Lawyer.Core.Exceptions.Result<object>.Error(System.Net.HttpStatusCode.BadRequest, "workflowId is required."));
            _logger.LogInformation("Running RulingAnalysis step {Step} for workflow {WorkflowId}", dto.StepNumber, dto.WorkflowId);
            var result = await _service.RunStepAsync(dto.WorkflowId.Value, dto.StepNumber, new RunRulingStepRequest(){ Input = dto.Input }, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpPut("{workflowId:int}/steps/{stepNumber:int}/save")]
        public async Task<IActionResult> SaveEditedStep(
            int workflowId, int stepNumber,
            [FromBody] SaveRulingStepRequest dto,
            CancellationToken ct)
        {
            _logger.LogInformation("Saving RulingAnalysis step {Step} for workflow {WorkflowId}", stepNumber, workflowId);
            var result = await _service.SaveEditedStepAsync(workflowId, stepNumber, dto.EditedOutputJson, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpPatch("{workflowId:int}/step/{stepNumber:int}/auto-save")]
        public async Task<IActionResult> AutoSaveStepDraft(
            int workflowId, int stepNumber,
            [FromBody] Lawyer.Application.Dtos.Workflows.SaveWorkflowDraftRequest dto,
            CancellationToken ct)
        {
            var result = await _service.SaveDraftAsync(workflowId, dto, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpPost("abandon/{id}")]
        public async Task<IActionResult> AbandonWorkflow(int id, CancellationToken ct)
        {
            _logger.LogInformation("Abandoning RulingAnalysis workflow {Id}", id);
            var result = await _service.AbandonWorkflowAsync(id, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpPost("{id}/advance-stage")]
        public async Task<IActionResult> AdvanceStage(int id, [FromBody] Application.Dtos.Workflows.TransitionStageRequestDto request, CancellationToken ct)
        {
            var result = await _service.AdvanceStageAsync(Guid.Empty, id, request.FromStep, request.ToStep, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpPost("{id}/recover-conflict")]
        public async Task<IActionResult> RecoverConflict(int id, [FromBody] Application.Dtos.Workflows.RecoverConflictRequest request, CancellationToken ct)
        {
            var result = await _service.RecoverConflictAsync(Guid.Empty, id, request.StepNumber, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }
    }
}
