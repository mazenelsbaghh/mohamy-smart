using Lawyer.Application.Common;
using Lawyer.Application.Dtos.LawyerTask;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Controllers
{
	[Route("api/v1/[controller]")]
	[ApiController]
	[Authorize]
	public class LawyerTaskController : AppControllerBase
	{
		private readonly ILawyerTaskService _service;
		private readonly ILogger<LawyerTaskController> _logger;
		private readonly ILawyerIdResolver _lawyerIdResolver;
		private readonly IUserContextProvider _userContextProvider;

		public LawyerTaskController(ILawyerTaskService service, ILogger<LawyerTaskController> logger, ILawyerIdResolver lawyerIdResolver, IUserContextProvider userContextProvider)
		{
			_service = service;
			_logger = logger;
			_lawyerIdResolver = lawyerIdResolver;
			_userContextProvider = userContextProvider;
		}

		private bool IsLawyer() => User.IsInRole("Lawyer");

		[HttpPost("create")]
		public async Task<IActionResult> Create([FromBody] CreateLawyerTaskDto model, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Creating new task: {Title}", model.Title);
			var userContext = _userContextProvider.GetCurrentContext();
			var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
			if (!lawyerIdResult.Succeeded)
				return CreateResponse(lawyerIdResult);
			var result = await _service.CreateAsync(model, lawyerIdResult.Data, cancellationToken);
			return CreateResponse(result);
		}

		[HttpGet]
		public async Task<IActionResult> GetAll(
			[FromQuery] int pageNumber = 1,
			[FromQuery] int pageSize = 10,
			[FromQuery] Guid? lawyerId = null,
			CancellationToken cancellationToken = default)
		{
			Guid? effectiveLawyerId = lawyerId;
			if (IsLawyer())
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				effectiveLawyerId = lawyerIdResult.Data;
			}
			var result = await _service.GetAllAsync(pageNumber, pageSize, effectiveLawyerId, cancellationToken);
			return CreateResponse(result);
		}

		[HttpGet("{id:guid}")]
		public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Fetching task by ID: {Id}", id);
			var isLawyer = IsLawyer();
			var lawyerId = Guid.Empty;
			if (isLawyer)
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				lawyerId = lawyerIdResult.Data;
			}
			var result = await _service.GetByIdAsync(id, isLawyer, lawyerId, cancellationToken);
			return CreateResponse(result);
		}

		[HttpPut("{id:guid}")]
		public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLawyerTaskDto model, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Updating task {Id}", id);
			var isLawyer = IsLawyer();
			var lawyerId = Guid.Empty;
			if (isLawyer)
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				lawyerId = lawyerIdResult.Data;
			}
			var result = await _service.UpdateAsync(id, model, isLawyer, lawyerId, cancellationToken);
			return CreateResponse(result);
		}

		[HttpDelete("{id:guid}")]
		public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Deleting task {Id}", id);
			var isLawyer = IsLawyer();
			var lawyerId = Guid.Empty;
			if (isLawyer)
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				lawyerId = lawyerIdResult.Data;
			}
			var result = await _service.DeleteAsync(id, isLawyer, lawyerId, cancellationToken);
			return CreateResponse(result);
		}

		[HttpGet("calendar")]
		public async Task<IActionResult> GetByPeriod(
			[FromQuery] TaskPeriod period,
			[FromQuery] DateTime date,
			[FromQuery] Guid? lawyerId = null,
			CancellationToken cancellationToken = default)
		{
			Guid? effectiveLawyerId = lawyerId;
			if (IsLawyer())
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				effectiveLawyerId = lawyerIdResult.Data;
			}
			_logger.LogInformation("Fetching tasks for period {Period} around {Date}", period, date);
			var result = await _service.GetByPeriodAsync(period, date, effectiveLawyerId, cancellationToken);
			return CreateResponse(result);
		}
	}
}
