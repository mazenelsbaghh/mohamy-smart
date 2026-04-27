using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Lawyer.Controllers
{
    [Route("api/v1/ai-usage")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AiUsageController : AppControllerBase
    {
        private readonly IAiUsageReportService _aiUsageReportService;

        public AiUsageController(IAiUsageReportService aiUsageReportService)
        {
            _aiUsageReportService = aiUsageReportService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            CancellationToken ct = default)
        {
            var result = await _aiUsageReportService.GetUsageSummaryAsync(from, to, ct);
            return CreateResponse(result);
        }

        [HttpGet("lawyers")]
        public async Task<IActionResult> GetLawyerUsage(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            CancellationToken ct = default)
        {
            var result = await _aiUsageReportService.GetLawyerUsageAsync(pageNumber, pageSize, from, to, ct);
            return CreateResponse(result);
        }

        [HttpGet("lawyers/{lawyerId:guid}")]
        public async Task<IActionResult> GetLawyerUsageDetail(
            Guid lawyerId,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            CancellationToken ct = default)
        {
            var result = await _aiUsageReportService.GetLawyerUsageDetailAsync(lawyerId, from, to, ct);
            return CreateResponse(result);
        }

        [HttpGet("models")]
        public async Task<IActionResult> GetModelUsage(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            CancellationToken ct = default)
        {
            var result = await _aiUsageReportService.GetModelUsageAsync(from, to, ct);
            return CreateResponse(result);
        }
    }
}
