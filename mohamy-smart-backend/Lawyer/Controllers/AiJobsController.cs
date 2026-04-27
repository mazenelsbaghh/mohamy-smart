using Lawyer.Application.Dtos.AiJobs;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Lawyer.Controllers
{
    [Route("api/v1/cases/{caseId}/ai-jobs")]
    [ApiController]
    [Authorize]
    public class AiJobsController : AppControllerBase
    {
        private readonly ILogger<AiJobsController> _logger;
        private readonly IAiJobService _service;

        public AiJobsController(ILogger<AiJobsController> logger, IAiJobService service)
        {
            _logger = logger;
            _service = service;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

        [HttpGet]
        public async Task<IActionResult> GetAll(Guid caseId, CancellationToken ct)
        {
            _logger.LogInformation("GetAllAiJobs called for Case {CaseId}", caseId);
            var result = await _service.GetAllByCaseAsync(caseId, GetUserId(), ct);
            return CreateResponse(result);
        }

        [HttpGet("{stepType}")]
        public async Task<IActionResult> GetByStep(Guid caseId, AiStepType stepType, CancellationToken ct)
        {
            _logger.LogInformation("GetAiJobByStep called for Case {CaseId}, Step {Step}", caseId, stepType);
            var result = await _service.GetByCaseAndStepAsync(caseId, stepType, GetUserId(), ct);
            return CreateResponse(result);
        }

        [HttpPost]
        public async Task<IActionResult> Submit(Guid caseId, [FromBody] SubmitAiJobDto dto, CancellationToken ct)
        {
            _logger.LogInformation("SubmitAiJob called for Case {CaseId}, Step {Step}", caseId, dto.StepType);
            var result = await _service.SubmitAsync(caseId, dto, GetUserId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("{stepType}/retry")]
        public async Task<IActionResult> Retry(Guid caseId, AiStepType stepType, [FromBody] SubmitAiJobDto dto, CancellationToken ct)
        {
            _logger.LogInformation("RetryAiJob called for Case {CaseId}, Step {Step}", caseId, stepType);
            var result = await _service.RetryAsync(caseId, stepType, dto, GetUserId(), ct);
            return CreateResponse(result);
        }

        [HttpPost("{stepType}/cancel")]
        public async Task<IActionResult> Cancel(Guid caseId, AiStepType stepType, CancellationToken ct)
        {
            _logger.LogInformation("CancelAiJob called for Case {CaseId}, Step {Step}", caseId, stepType);
            var result = await _service.CancelAsync(caseId, stepType, GetUserId(), ct);
            return CreateResponse(result);
        }
    }
}
