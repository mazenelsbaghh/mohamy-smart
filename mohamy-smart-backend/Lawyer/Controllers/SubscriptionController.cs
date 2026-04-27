using Lawyer.Application.Dto.Auth;
using Lawyer.Application.Dtos;
using Lawyer.Application.IServices;
using Lawyer.Application.Validators;
using FluentValidation;
using Lawyer.Controllers.Base;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using System.Security.Claims;

namespace Lawyer.Controllers
{
	[Route("api/v1/[controller]")]
	[ApiController]
	public class SubscriptionController : AppControllerBase
	{
		private readonly ISubscriptionService _subscriptionService;
		private readonly IUnitOfWork _unitOfWork;
		private readonly IValidator<UpdateSubscriptionDto> _updateSubscriptionDtoValidator;

		public SubscriptionController(ISubscriptionService subscriptionService, IUnitOfWork unitOfWork, IValidator<UpdateSubscriptionDto> updateSubscriptionDtoValidator)
		{
			_subscriptionService = subscriptionService;
			_unitOfWork = unitOfWork;
			_updateSubscriptionDtoValidator = updateSubscriptionDtoValidator;
		}

		/// <summary>
		/// Subscription activation now requires payment. Use POST /api/payment/initiate instead.
		/// This endpoint is kept for admin use only.
		/// </summary>
		[Authorize(Roles = "Admin")]
		[HttpPost()]
		public async Task<IActionResult> subscribe([FromQuery] Guid lawyerId, int subscriptionId, string billingCycle = "monthly", CancellationToken cancellationToken = default)
		{
			var result = await _subscriptionService.SubscribeAsync(lawyerId , subscriptionId, billingCycle, cancellationToken);
			return CreateResponse(result);
		}

		[Authorize(Roles = "Admin")]
		[HttpPost("plan")]
		public async Task<IActionResult> CreatePlan([FromBody] CreateSubscriptionDto dto , CancellationToken cancellationToken)
		{
			var result = await _subscriptionService.CreatePlanAsync(dto, cancellationToken);
			return CreateResponse(result);
		}

		[Authorize]
		[HttpGet()]
		[OutputCache(Duration = 300)]
		public async Task<IActionResult> GetPlans(CancellationToken cancellationToken)
		{
			var result = await _subscriptionService.GetAllPlansAsync( cancellationToken);
			return CreateResponse(result);
		}

		[Authorize]
		[HttpGet("paginated")]
		[OutputCache(Duration = 300)]
		public async Task<IActionResult> GetPlansPaginated([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
		{
			var result = await _subscriptionService.GetAllPlansAsync(pageNumber, pageSize, cancellationToken);
			return CreateResponse(result);
		}

		[Authorize]
		[HttpGet("lawyer")]
		public async Task<IActionResult> GetLawyerPlan([FromQuery] Guid? lawyerId, CancellationToken cancellationToken)
		{
			Guid resolvedLawyerId;

			if (User.IsInRole("Admin") && lawyerId.HasValue && lawyerId.Value != Guid.Empty)
			{
				resolvedLawyerId = lawyerId.Value;
			}
			else
			{
				var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
				if (string.IsNullOrEmpty(userId))
					return Unauthorized(Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

				var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
					.FirstOrDefaultAsync(l => l.ApplicationUserId == Guid.Parse(userId));

				if (lawyer == null)
					return BadRequest(Result<string>.Error(System.Net.HttpStatusCode.BadRequest, "Lawyer profile not found."));

				resolvedLawyerId = lawyer.Id;
			}

			var result = await _subscriptionService.GetLawyerPlanAsync(resolvedLawyerId, cancellationToken);
			return CreateResponse(result);
		}

		[Authorize(Roles = "Admin")]
		[HttpGet("lawyers")]
		public async Task<IActionResult> GetLawyersPlan([FromQuery] bool? isActive, CancellationToken cancellationToken)
		{
			var result = await _subscriptionService.GetLawyersPlanAsync(isActive, cancellationToken);
			return CreateResponse(result);
		}

		[Authorize]
		[HttpPut("upgrade")]
		public async Task<IActionResult> UpgradeSubscription([FromQuery] int newSubscriptionId, [FromQuery] string billingCycle = "monthly", CancellationToken cancellationToken = default)
		{
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId))
				return Unauthorized(Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
				.FirstOrDefaultAsync(l => l.ApplicationUserId == Guid.Parse(userId));

			if (lawyer == null)
				return BadRequest(Result<string>.Error(System.Net.HttpStatusCode.BadRequest, "Lawyer profile not found."));

			var result = await _subscriptionService.UpgradeSubscriptionAsync(lawyer.Id, newSubscriptionId, billingCycle, cancellationToken);
			return CreateResponse(result);
		}

		[Authorize(Roles = "Admin")]
		[HttpPut("plan/{id:int}")]
		public async Task<IActionResult> EditPlan(int id, [FromBody] UpdateSubscriptionDto dto, CancellationToken cancellationToken)
		{
			var validationResult = await _updateSubscriptionDtoValidator.ValidateAsync(dto, cancellationToken);
			if (!validationResult.IsValid)
			{
				var errorMessages = validationResult.Errors.Select(error => error.ErrorMessage).ToList();
				return BadRequest(Result<string>.Error(System.Net.HttpStatusCode.BadRequest, errorMessages.FirstOrDefault()!));
			}

			var result = await _subscriptionService.EditPlanAsync(id, dto, cancellationToken);
			return CreateResponse(result);
		}

		[Authorize(Roles = "Admin")]
		[HttpPut("lawyer-subscription/{id:guid}")]
		public async Task<IActionResult> EditLawyerSubscription(Guid id, CancellationToken cancellationToken)
		{
			var result = await _subscriptionService.EditLawyerSubscriptionAsync(id, cancellationToken);
			return CreateResponse(result);
		}

		/// <summary>
		/// Archive (soft-delete) a subscription plan. Blocked if plan has active subscribers.
		/// </summary>
		[Authorize(Roles = "Admin")]
		[HttpPatch("plan/{id:int}/archive")]
		public async Task<IActionResult> ArchivePlan(int id, CancellationToken cancellationToken)
		{
			var result = await _subscriptionService.ArchivePlanAsync(id, cancellationToken);
			return CreateResponse(result);
		}

		/// <summary>
		/// Public endpoint: returns plans marked to display on the landing page.
		/// No authentication required.
		/// </summary>
		[AllowAnonymous]
		[HttpGet("landing")]
		[OutputCache(Duration = 600)]
		public async Task<IActionResult> GetLandingPlans(CancellationToken cancellationToken)
		{
			var result = await _subscriptionService.GetLandingPlansAsync(cancellationToken);
			return CreateResponse(result);
		}
    }
}
