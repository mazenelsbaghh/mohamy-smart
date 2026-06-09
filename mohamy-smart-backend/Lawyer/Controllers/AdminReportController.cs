using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;

namespace Lawyer.Controllers
{
	[Route("api/v1/admin/reports")]
	[ApiController]
	[Authorize(Roles = "Admin")]
	public class AdminReportController : AppControllerBase
	{
		private readonly IAdminReportService _adminReportService;
		private readonly IValidationFailureService _validationFailureService;

		public AdminReportController(IAdminReportService adminReportService, IValidationFailureService validationFailureService)
		{
			_adminReportService = adminReportService;
			_validationFailureService = validationFailureService;
		}

		[HttpGet("lawyers")]
		public async Task<IActionResult> GetLawyersReport(CancellationToken cancellationToken)
		{
			var result = await _adminReportService.GetLawyersReportAsync(cancellationToken);
			return CreateResponse(result);
		}

		[HttpGet("subscriptions")]
		public async Task<IActionResult> GetSubscriptionsReport([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50, CancellationToken cancellationToken = default)
		{
			var result = await _adminReportService.GetSubscriptionsReportAsync(pageNumber, pageSize, cancellationToken);
			return CreateResponse(result);
		}

		[HttpGet("revenue")]
		public async Task<IActionResult> GetRevenueReport([FromQuery] ReportPeriod period = ReportPeriod.Monthly, CancellationToken cancellationToken = default)
		{
			var result = await _adminReportService.GetRevenueReportAsync(period, cancellationToken);
			return CreateResponse(result);
		}

		[HttpGet("validation-failures")]
		public async Task<IActionResult> GetValidationFailures(
			[FromQuery] int page = 1,
			[FromQuery] int pageSize = 20,
			[FromQuery] string? workflowType = null,
			[FromQuery] int? stepType = null,
			[FromQuery] DateTime? from = null,
			[FromQuery] DateTime? to = null,
			CancellationToken ct = default)
		{
			var result = await _validationFailureService.GetFailuresAsync(page, pageSize, workflowType, stepType, from, to, ct);
			return CreateResponse(result);
		}

		[HttpGet("account-messaging")]
		public async Task<IActionResult> GetAccountMessagingAudit(CancellationToken cancellationToken)
		{
			var result = await _adminReportService.GetAccountMessagingAuditAsync(cancellationToken);
			return CreateResponse(result);
		}

		[HttpGet("lawyers-cases-stats")]
		public async Task<IActionResult> GetLawyersCasesStats(
			[FromQuery] int pageNumber = 1,
			[FromQuery] int pageSize = 50,
			[FromQuery] string? search = null,
			CancellationToken cancellationToken = default)
		{
			var result = await _adminReportService.GetLawyersCasesStatsAsync(pageNumber, pageSize, search, cancellationToken);
			return CreateResponse(result);
		}
	}
}
