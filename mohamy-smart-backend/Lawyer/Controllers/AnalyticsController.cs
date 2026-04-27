using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AnalyticsController : AppControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("financial")]
        public async Task<IActionResult> GetFinancialMetrics()
        {
            var result = await _analyticsService.GetFinancialMetricsAsync();
            return CreateResponse(result);
        }

        [HttpGet("subscriptions")]
        public async Task<IActionResult> GetSubscriptionMetrics()
        {
            var result = await _analyticsService.GetSubscriptionMetricsAsync();
            return CreateResponse(result);
        }

        [HttpGet("engagement")]
        public async Task<IActionResult> GetEngagementMetrics()
        {
            var result = await _analyticsService.GetEngagementMetricsAsync();
            return CreateResponse(result);
        }

        [HttpGet("cohorts")]
        public async Task<IActionResult> GetCohortAnalysis()
        {
            var result = await _analyticsService.GetCohortAnalysisAsync();
            return CreateResponse(result);
        }
    }
}
