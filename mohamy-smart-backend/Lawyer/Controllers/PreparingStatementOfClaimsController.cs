using Lawyer.Application.Dtos.PreparingStatementOfClaims;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize]
    [EnableRateLimiting("AiEndpoints")]
	public class PreparingStatementOfClaimsController : AppControllerBase
    {
        private readonly ILogger<PreparingStatementOfClaimsController> _logger;
        private readonly IPreparingStatementOfClaimsService _service;

        public PreparingStatementOfClaimsController(
            ILogger<PreparingStatementOfClaimsController> logger,
            IPreparingStatementOfClaimsService service)
        {
            _logger = logger;
            _service = service;
        }

        private string GetLawyerId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

        [Authorize]
        [HttpGet("case/{caseId}")]
        public async Task<IActionResult> GetSummaryByCase(Guid caseId, CancellationToken ct)
        {
            _logger.LogInformation("GetSummaryByCase endpoint called for Case ID: {CaseId}", caseId);
            var result = await _service.GetSummaryByCaseIdAsync(caseId, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> StartWorkflow(
            [FromBody] Application.Dtos.PreparingStatementOfClaims.StartStatementOfClaimsRequest dto,
            CancellationToken ct)
        {
            _logger.LogInformation("StartWorkflow endpoint called for Case ID: {CaseId}", dto.CaseId);
            var result = await _service.InitializeWorkflowAsync(dto.CaseId, GetLawyerId(), ct);
            return CreateResponse(result);
        }

        [Authorize]
        [CheckAiQuota]
        [HttpPost("lawsuit-case-type")]
        public async Task<IActionResult> ClassifyLawSuitCaseType(
            [FromBody] LawSuitCaseTypeRequestDto dto,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("ClassifyLawSuitCaseType endpoint called for Case ID: {CaseId}", dto.CaseId);

            var result = await _service.ClassifyLawSuitCaseTypeAsync(dto, GetLawyerId(), cancellationToken);
            return CreateResponse(result);
        }

        [HttpGet("lawsuit-case-type/{caseId}")]
        public async Task<IActionResult> GetLawSuitCaseTypeByCaseId(
            Guid caseId,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("GetLawSuitCaseTypeByCaseId endpoint called for Case ID: {CaseId}", caseId);

            var result = await _service.GetLawSuitCaseTypeByCaseIdAsync(caseId, GetLawyerId(), cancellationToken);
            return CreateResponse(result);
        }

        #region LawSuit Parties

        [Authorize]
        [CheckAiQuota]
        [HttpPost("lawsuit-parties")]
        public async Task<IActionResult> ExtractLawSuitParties(
            [FromBody] LawSuitPartiesRequestDto dto,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("ExtractLawSuitParties endpoint called for Case ID: {CaseId}", dto.CaseId);

            var result = await _service.ExtractLawSuitPartiesAsync(dto, GetLawyerId(), cancellationToken);
            return CreateResponse(result);
        }

        [HttpGet("lawsuit-parties/{caseId}")]
        public async Task<IActionResult> GetLawSuitPartiesByCaseId(
            Guid caseId,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("GetLawSuitPartiesByCaseId endpoint called for Case ID: {CaseId}", caseId);

            var result = await _service.GetLawSuitPartiesByCaseIdAsync(caseId, GetLawyerId(), cancellationToken);
            return CreateResponse(result);
        }

        #endregion

        #region LawSuit Subjects

        [Authorize]
        [CheckAiQuota]
        [HttpPost("lawsuit-subjects")]
        public async Task<IActionResult> GenerateLawSuitSubjects(
            [FromBody] LawSuitSubjectsRequestDto dto,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("GenerateLawSuitSubjects endpoint called for Case ID: {CaseId}", dto.CaseId);

            var result = await _service.GenerateLawSuitSubjectsAsync(dto, GetLawyerId(), cancellationToken);
            return CreateResponse(result);
        }

        [HttpGet("lawsuit-subjects/{caseId}")]
        public async Task<IActionResult> GetLawSuitSubjectsByCaseId(
            Guid caseId,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("GetLawSuitSubjectsByCaseId endpoint called for Case ID: {CaseId}", caseId);

            var result = await _service.GetLawSuitSubjectsByCaseIdAsync(caseId, GetLawyerId(), cancellationToken);
            return CreateResponse(result);
        }

        #endregion

        #region LawSuit Facts

        [Authorize]
        [CheckAiQuota]
        [HttpPost("lawsuit-facts")]
        public async Task<IActionResult> GenerateLawSuitFacts(
            [FromBody] LawSuitFactsRequestDto dto,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("GenerateLawSuitFacts endpoint called for Case ID: {CaseId}", dto.CaseId);

            var result = await _service.GenerateLawSuitFactsAsync(dto, GetLawyerId(), cancellationToken);
            return CreateResponse(result);
        }

        [HttpGet("lawsuit-facts/{caseId}")]
        public async Task<IActionResult> GetLawSuitFactsByCaseId(
            Guid caseId,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("GetLawSuitFactsByCaseId endpoint called for Case ID: {CaseId}", caseId);

            var result = await _service.GetLawSuitFactsByCaseIdAsync(caseId, GetLawyerId(), cancellationToken);
            return CreateResponse(result);
        }

        #endregion

        #region LawSuit Legal Basis

        [Authorize]
        [CheckAiQuota]
        [HttpPost("lawsuit-legal-basis")]
        public async Task<IActionResult> GenerateLawSuitLegalBasis(
            [FromBody] LawSuitLegalBasisRequestDto dto,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("GenerateLawSuitLegalBasis endpoint called for Case ID: {CaseId}", dto.CaseId);

            var result = await _service.GenerateLawSuitLegalBasisAsync(dto, GetLawyerId(), cancellationToken);
            return CreateResponse(result);
        }

        [HttpGet("lawsuit-legal-basis/{caseId}")]
        public async Task<IActionResult> GetLawSuitLegalBasisByCaseId(
            Guid caseId,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("GetLawSuitLegalBasisByCaseId endpoint called for Case ID: {CaseId}", caseId);

            var result = await _service.GetLawSuitLegalBasisByCaseIdAsync(caseId, GetLawyerId(), cancellationToken);
            return CreateResponse(result);
        }

        #endregion

        #region LawSuit Requests

        [Authorize]
        [CheckAiQuota]
        [HttpPost("lawsuit-requests")]
        public async Task<IActionResult> GenerateLawSuitRequests(
            [FromBody] LawSuitRequestsRequestDto dto,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("GenerateLawSuitRequests endpoint called for Case ID: {CaseId}", dto.CaseId);

            var result = await _service.GenerateLawSuitRequestsAsync(dto, GetLawyerId(), cancellationToken);
            return CreateResponse(result);
        }

        [HttpGet("lawsuit-requests/{caseId}")]
        public async Task<IActionResult> GetLawSuitRequestsByCaseId(
            Guid caseId,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("GetLawSuitRequestsByCaseId endpoint called for Case ID: {CaseId}", caseId);

            var result = await _service.GetLawSuitRequestsByCaseIdAsync(caseId, GetLawyerId(), cancellationToken);
            return CreateResponse(result);
        }

        #endregion

        [Authorize]
        [HttpPost("{caseId:guid}/abandon")]
        public async Task<IActionResult> AbandonWorkflow(Guid caseId, CancellationToken cancellationToken)
        {
            _logger.LogInformation("AbandonWorkflow endpoint called for Case ID: {CaseId}", caseId);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(Lawyer.Core.Exceptions.Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

            var result = await _service.AbandonWorkflowAsync(caseId, userId, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPatch("{caseId:guid}/step/{stepNumber:int}/auto-save")]
        public async Task<IActionResult> AutoSaveStepDraft(
            Guid caseId, int stepNumber,
            [FromBody] Lawyer.Application.Dtos.Workflows.SaveWorkflowDraftRequest dto,
            CancellationToken ct)
        {
            var result = await _service.SaveDraftAsync(caseId, stepNumber, dto, GetLawyerId(), ct);
            return CreateResponse(result);
        }
    }
}
