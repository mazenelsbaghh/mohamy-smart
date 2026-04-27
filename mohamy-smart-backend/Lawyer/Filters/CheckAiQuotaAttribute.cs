using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace Lawyer.Filters
{
	[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
	public class CheckAiQuotaAttribute : TypeFilterAttribute
	{
		public CheckAiQuotaAttribute() : base(typeof(AiQuotaFilter))
		{
		}
	}

	public class AiQuotaFilter : IAsyncActionFilter
	{
		private readonly ISubscriptionService _subscriptionService;
		private readonly IUnitOfWork _unitOfWork;

		public AiQuotaFilter(ISubscriptionService subscriptionService, IUnitOfWork unitOfWork)
		{
			_subscriptionService = subscriptionService;
			_unitOfWork = unitOfWork;
		}

		public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
		{
			var userId = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

			if (string.IsNullOrEmpty(userId))
			{
				context.Result = new UnauthorizedObjectResult(
					Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));
				return;
			}

			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()!
				.FirstOrDefaultAsync(l => l.ApplicationUserId == Guid.Parse(userId));

			if (lawyer == null)
			{
				context.Result = new BadRequestObjectResult(
					Result<string>.Error(System.Net.HttpStatusCode.BadRequest, "Lawyer profile not found."));
				return;
			}

			var result = await _subscriptionService.UseAiRequestAsync(lawyer.Id, context.HttpContext.RequestAborted);

			if (!result.Succeeded)
			{
				context.Result = new ObjectResult(result) { StatusCode = (int)result.StatusCode };
				return;
			}

			await next();
		}
	}
}
