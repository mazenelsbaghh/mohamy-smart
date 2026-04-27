using Lawyer.Application.Dtos.Case;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.RateLimiting;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [EnableRateLimiting("AiEndpoints")]
	public class ClarifyFactsController : AppControllerBase
    {
        private readonly ILogger<ClarifyFactsController> _logger;
        private readonly IClarifyFactsService _service;

        public ClarifyFactsController(
            ILogger<ClarifyFactsController> logger,
            IClarifyFactsService service)
        {
            _logger = logger;
            _service = service;
        }

        /// <summary>
        /// Pre-flight endpoint: evaluates the case facts for material gaps
        /// and returns 3–7 clarification questions (each with 3 suggested answers).
        /// Returns an empty list if the facts are comprehensive.
        /// </summary>
        [Authorize]
        [CheckAiQuota]
        [HttpPost("evaluate")]
        public async Task<IActionResult> EvaluateFactsGaps(
            [FromBody] ClarifyFactsRequestDto dto,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("EvaluateFactsGaps endpoint called for Case {CaseId}", dto.CaseId);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(Lawyer.Core.Exceptions.Result<string>.Error(
                    System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

            var result = await _service.EvaluateFactsGapsAsync(dto, userId, cancellationToken);
            return CreateResponse(result);
        }
    }
}
