using Lawyer.Application.Dtos;
using Lawyer.Core.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
	public interface ISubscriptionService
	{
		Task<Result<SubscriptionDto>> CreatePlanAsync(CreateSubscriptionDto dto, CancellationToken cancellationToken);
		Task<Result<List<SubscriptionDto>>> GetAllPlansAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
		Task<Result<PaginatedResult<SubscriptionDto>>> GetAllPlansAsync(int pageNumber, int pageSize, CancellationToken cancellationToken);
		Task<Result<LawyerSubscriptionDto>> SubscribeAsync(Guid lawyerId, int subscriptionId, string billingCycle, CancellationToken cancellationToken);
		Task<Result<LawyerSubscriptionDto>> GetLawyerPlanAsync(Guid lawyerId, CancellationToken cancellationToken);
		Task<bool> CheckAiRequestAvailability(Guid lawyerId, CancellationToken cancellationToken = default);
		Task<Result<string>> UseAiRequestAsync(Guid lawyerId, CancellationToken cancellationToken = default);

		Task<Result<LawyerSubscriptionDto>> UpgradeSubscriptionAsync(Guid lawyerId, int newSubscriptionId, string billingCycle, CancellationToken cancellationToken);
		Task<Result<List<LawyerSubscriptionDto>>> GetLawyersPlanAsync(bool? isActive, CancellationToken cancellationToken);
		Task<Result<SubscriptionDto>> EditPlanAsync(int id, UpdateSubscriptionDto dto, CancellationToken cancellationToken);
		Task<Result<LawyerSubscriptionDto>> EditLawyerSubscriptionAsync(Guid lawyerSubscriptionId, CancellationToken cancellationToken);

		/// <summary>
		/// Archive a plan so it is no longer available for new purchases.
		/// Blocked if the plan still has active customer subscriptions.
		/// </summary>
		Task<Result<bool>> ArchivePlanAsync(int planId, CancellationToken cancellationToken);

		/// <summary>
		/// Restore an archived subscription plan.
		/// </summary>
		Task<Result<bool>> RestorePlanAsync(int planId, CancellationToken cancellationToken);

		/// <summary>
		/// Expire active lawyer subscriptions whose end date has passed.
		/// </summary>
		Task<Result<int>> ExpireExpiredSubscriptionsAsync(CancellationToken cancellationToken = default);

		/// <summary>
		/// Public endpoint: returns only plans where ShowOnLanding == true.
		/// </summary>
		Task<Result<List<SubscriptionDto>>> GetLandingPlansAsync(CancellationToken cancellationToken);
	}

}
