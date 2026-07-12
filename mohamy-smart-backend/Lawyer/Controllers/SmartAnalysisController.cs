using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Application.Dtos.Workflows;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.IRepositories;
using Lawyer.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [EnableRateLimiting("AiEndpoints")]
	public class SmartAnalysisController : AppControllerBase
    {
        private readonly ILogger<SmartAnalysisController> _logger;
        private readonly IFactAnalysisService _factAnalysisService;
        private readonly IDefenseService _defenseService;
        private readonly ICaseSummaryService _caseSummaryService;
        private readonly ISmartChatService _chatService;
        private readonly IDraftAutoSaveService _draftAutoSaveService;
        private readonly IUnitOfWork _unitOfWork;

        public SmartAnalysisController(
            ILogger<SmartAnalysisController> logger,
            IFactAnalysisService factAnalysisService,
            IDefenseService defenseService,
            ICaseSummaryService caseSummaryService,
            ISmartChatService chatService,
            IDraftAutoSaveService draftAutoSaveService,
            IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _factAnalysisService = factAnalysisService;
            _defenseService = defenseService;
            _caseSummaryService = caseSummaryService;
            _chatService = chatService;
            _draftAutoSaveService = draftAutoSaveService;
            _unitOfWork = unitOfWork;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;


        [Authorize]
        [CheckAiQuota]
        [HttpPost("legal-analysis")]
        public async Task<IActionResult> AnalyzeCaseFacts([FromBody]CaseAnalysisRequestDto dto , CancellationToken cancellationToken)
        {
            _logger.LogInformation("AnalyzeCaseFacts endpoint called.");

            var result = await _factAnalysisService.AnalyzeCaseFactsAsync(dto, GetUserId(), cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [HttpGet("fact-analysis/{caseId}")]
        public async Task<IActionResult> GetFactAnalysisByCaseId(Guid caseId, CancellationToken cancellationToken)
        {
            _logger.LogInformation("GetFactAnalysisByCaseId endpoint called for Case ID: {CaseId}", caseId);

            var result = await _factAnalysisService.GetFactAnalysisByCaseIdAsync(caseId, GetUserId(), cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [CheckAiQuota]
        [HttpPost("generate-defenses")]
        public async Task<IActionResult> GenerateDefenses([FromBody] CaseDefensesRequestDto dto, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Generate Defenses endpoint called.");

            var result = await _defenseService.GenerateCaseDefensesAsync(dto, GetUserId(), cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [HttpGet("defenses/{caseId}")]
        public async Task<IActionResult> GetDefensesByCaseId(Guid caseId, CancellationToken cancellationToken)
        {
            _logger.LogInformation("GetDefensesByCaseId endpoint called for Case ID: {CaseId}", caseId);

            var result = await _defenseService.GetDefensesByCaseIdAsync(caseId, GetUserId(), cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [HttpPost("defenses")]
        public async Task<IActionResult> CreateDefense([FromBody] CreateDefenseRequestDto dto, CancellationToken cancellationToken)
        {
            _logger.LogInformation("CreateDefense endpoint called for Case ID: {CaseId}", dto.CaseId);

            var result = await _defenseService.CreateDefenseAsync(dto, GetUserId(), cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [HttpPut("defenses/{defenseId:guid}")]
        public async Task<IActionResult> UpdateDefenseTitle(Guid defenseId, [FromBody] UpdateDefenseTitleRequestDto dto, CancellationToken cancellationToken)
        {
            _logger.LogInformation("UpdateDefenseTitle endpoint called for Defense ID: {DefenseId}", defenseId);

            var result = await _defenseService.UpdateDefenseTitleAsync(defenseId, dto, GetUserId(), cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [HttpDelete("defenses/{defenseId:guid}")]
        public async Task<IActionResult> DeleteDefense(Guid defenseId, CancellationToken cancellationToken)
        {
            _logger.LogInformation("DeleteDefense endpoint called for Defense ID: {DefenseId}", defenseId);

            var result = await _defenseService.DeleteDefenseAsync(defenseId, GetUserId(), cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [CheckAiQuota]
        [HttpPost("analyze-defense")]
        public async Task<IActionResult> AnalyzeSingleDefense([FromBody] AnalyzeDefenseRequestDto dto, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Generate Defenses endpoint called.");

            var result = await _defenseService.AnalyzeDefenseAsync(dto, GetUserId(), cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [HttpGet("defense-analysis/{defenseId}")]
        public async Task<IActionResult> GetDefenseAnalysisByDefenseId(Guid defenseId, CancellationToken cancellationToken)
        {
            _logger.LogInformation("GetDefenseAnalysisByDefenseId endpoint called for Defense ID: {DefenseId}", defenseId);

            var result = await _defenseService.GetDefenseAnalysisByDefenseIdAsync(defenseId, GetUserId(), cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [CheckAiQuota]
        [HttpPost("final-requirements")]
        public async Task<IActionResult> GenerateFinalRequirements([FromBody] FinalRequirementsRequestDto dto, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Generate Final Requirements endpoint called.");

            var result = await _defenseService.GenerateFinalRequirementsAsync(dto, GetUserId(), cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [HttpGet("case/{caseId}")]
        public async Task<IActionResult> GetCaseSmartAnalysisSummary(Guid caseId, CancellationToken cancellationToken)
        {
            _logger.LogInformation("GetCaseSmartAnalysisSummary endpoint called for Case ID: {CaseId}", caseId);

            var result = await _caseSummaryService.GetCaseSmartAnalysisSummaryAsync(caseId, GetUserId(), cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequestDto dto, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Chat endpoint called.");
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(Lawyer.Core.Exceptions.Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));
            
            var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
                .FirstOrDefaultAsync(l => l.ApplicationUserId == Guid.Parse(userId), cancellationToken);
            if (lawyer == null)
                return BadRequest(Lawyer.Core.Exceptions.Result<string>.Error(System.Net.HttpStatusCode.BadRequest, "Lawyer profile not found."));

            var result = await _chatService.ChatAsync(lawyer.Id, dto, cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [HttpPost("{caseId:guid}/abandon")]
        public async Task<IActionResult> AbandonAnalysis(Guid caseId, CancellationToken cancellationToken)
        {
            _logger.LogInformation("AbandonAnalysis endpoint called for Case ID: {CaseId}", caseId);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(Lawyer.Core.Exceptions.Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

            var result = await _defenseService.AbandonAnalysisAsync(caseId, userId, cancellationToken);
            return CreateResponse(result);
        }

        [Authorize]
        [HttpPatch("{caseId:guid}/step/{stepNumber:int}/auto-save")]
        public async Task<IActionResult> AutoSaveStepDraft(
            Guid caseId, int stepNumber,
            [FromBody] SaveWorkflowDraftRequest dto,
            CancellationToken ct)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _draftAutoSaveService.SaveDraftAsync(caseId, stepNumber, dto, userId, ct);
            return CreateResponse(result);
        }
    }
}
