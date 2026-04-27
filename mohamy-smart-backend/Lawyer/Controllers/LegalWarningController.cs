using Lawyer.Application.Dtos.LegalWarning;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(Roles = "Lawyer")]
    public class LegalWarningController : AppControllerBase
    {
        private readonly ILogger<LegalWarningController> _logger;
        private readonly ILegalWarningService _service;

        public LegalWarningController(
            ILogger<LegalWarningController> logger,
            ILegalWarningService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartWorkflow(
            [FromBody] StartLegalWarningRequest dto,
            CancellationToken ct)
        {
            _logger.LogInformation("Starting LegalWarning workflow for Case {CaseId}", dto.CaseId);
            var result = await _service.StartWorkflowAsync(dto, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetWorkflow(int id, CancellationToken ct)
        {
            _logger.LogInformation("Getting LegalWarning workflow {Id}", id);
            var result = await _service.GetWorkflowAsync(id, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpGet("case/{caseId:guid}")]
        public async Task<IActionResult> GetWorkflowsByCase(Guid caseId, CancellationToken ct)
        {
            _logger.LogInformation("Getting LegalWarning workflows for Case {CaseId}", caseId);
            var result = await _service.GetWorkflowsByCaseAsync(caseId, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpPost("steps/run")]
        public async Task<IActionResult> RunStep(
            [FromBody] Lawyer.Application.Services.Workflows.RunWorkflowStepRequest dto,
            CancellationToken ct)
        {
            if (dto.WorkflowId == null) return CreateResponse(Lawyer.Core.Exceptions.Result<object>.Error(System.Net.HttpStatusCode.BadRequest, "workflowId is required."));
            _logger.LogInformation("Running LegalWarning step {Step} for workflow {WorkflowId}", dto.StepNumber, dto.WorkflowId);
            var result = await _service.RunStepAsync(dto.WorkflowId.Value, dto.StepNumber, new RunWarningStepRequest(){ Input = dto.Input }, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }

        [HttpPut("{workflowId:int}/steps/{stepNumber:int}/save")]
        public async Task<IActionResult> SaveEditedStep(
            int workflowId, int stepNumber,
            [FromBody] SaveWarningStepRequest dto,
            CancellationToken ct)
        {
            _logger.LogInformation("Saving LegalWarning step {Step} for workflow {WorkflowId}", stepNumber, workflowId);
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
            _logger.LogInformation("Abandoning LegalWarning workflow {Id}", id);
            var result = await _service.AbandonWorkflowAsync(id, GetUserId().ToString(), ct);
            return CreateResponse(result);
        }
    }
}
