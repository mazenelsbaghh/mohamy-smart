using Lawyer.Application.Common;
using Lawyer.Application.Dtos.Case;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Controllers
{
	[Route("api/v1/[controller]")]
	[ApiController]
	[Authorize]
	public class CaseController : AppControllerBase
	{
		private readonly ICaseService _service;
        private readonly ILogger<CaseController> _logger;
		private readonly ILawyerIdResolver _lawyerIdResolver;
		private readonly IUserContextProvider _userContextProvider;

		public CaseController(ICaseService service, ILogger<CaseController> logger, ILawyerIdResolver lawyerIdResolver, IUserContextProvider userContextProvider)
		{
			_service = service;
			_logger = logger;
			_lawyerIdResolver = lawyerIdResolver;
			_userContextProvider = userContextProvider;
        }

		[HttpPost("create")]
		public async Task<IActionResult> Create([FromBody] CreateCaseDto model, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Creating new case: {Title}", model.Title);
			var userContext = _userContextProvider.GetCurrentContext();
			var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
			if (!lawyerIdResult.Succeeded)
				return CreateResponse(lawyerIdResult);

			var result = await _service.CreateCaseAsync(model, lawyerIdResult.Data, cancellationToken);
			return CreateResponse(result);
		}

		[HttpGet]
		public async Task<IActionResult> GetAllCases(
			[FromQuery] int pageNumber = 1,
			[FromQuery] int pageSize = 10,
			[FromQuery] Guid? lawyerId = null,
			[FromQuery] bool? isActive = null,
			CancellationToken cancellationToken = default)
		{
			var isLawyer = User.IsInRole("Lawyer");
			var effectiveLawyerId = lawyerId;
			if (isLawyer)
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				effectiveLawyerId = lawyerIdResult.Data;
			}

			var result = await _service.GetAllAsync(pageNumber, pageSize, effectiveLawyerId, isActive, cancellationToken);
			return CreateResponse(result);
		}


		[HttpGet("{id:guid}")]
		public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Fetching case by ID: {Id}", id);
			var isLawyer = User.IsInRole("Lawyer");
			var lawyerId = Guid.Empty;
			if (isLawyer)
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				lawyerId = lawyerIdResult.Data;
			}

			var result = await _service.GetByIdAsync(id, lawyerId, isLawyer, cancellationToken);
			return CreateResponse(result);
		}

		[HttpPut("{id:guid}")]
		public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCaseDto model, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Updating case {Id}", id);
			var isLawyer = User.IsInRole("Lawyer");
			var lawyerId = Guid.Empty;
			if (isLawyer)
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				lawyerId = lawyerIdResult.Data;
			}

			var result = await _service.UpdateCaseAsync(id, model, lawyerId, isLawyer, cancellationToken);
			return CreateResponse(result);
		}

		[HttpDelete("{id:guid}")]
		public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Deleting case {Id}", id);
			var isLawyer = User.IsInRole("Lawyer");
			var lawyerId = Guid.Empty;
			if (isLawyer)
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				lawyerId = lawyerIdResult.Data;
			}

			var result = await _service.DeleteCaseAsync(id, lawyerId, isLawyer, cancellationToken);
			return CreateResponse(result);
		}

		[HttpGet("dashboard-report")]
		public async Task<IActionResult> GetLawyerDashboardReport(CancellationToken cancellationToken)
		{
			_logger.LogInformation("Generating lawyer dashboard report");
			var userContext = _userContextProvider.GetCurrentContext();
			var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
			if (!lawyerIdResult.Succeeded)
				return CreateResponse(lawyerIdResult);

			var result = await _service.GetLawyerDashboardReportAsync(lawyerIdResult.Data, cancellationToken);
			return CreateResponse(result);
		}
    }
}
