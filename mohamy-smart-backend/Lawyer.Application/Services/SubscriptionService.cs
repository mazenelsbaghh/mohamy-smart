using Lawyer.Application.Common;
using Lawyer.Application.Dtos;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Enum;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
	public class SubscriptionService : ISubscriptionService
	{
		private readonly IUnitOfWork _unitOfWork;
		private readonly ILogger<SubscriptionService> _logger;
		private readonly IEmailService _emailService;

		public SubscriptionService(IUnitOfWork unitOfWork, ILogger<SubscriptionService> logger, IEmailService emailService)
		{
			_unitOfWork = unitOfWork;
			_logger = logger;
			_emailService = emailService;
		}

		public async Task<Result<SubscriptionDto>> CreatePlanAsync(CreateSubscriptionDto dto, CancellationToken cancellationToken)
		{
			var entity = new Subscription
			{
				Name = dto.Name,
				Features = dto.Features,
				Price = dto.Price,
				AiRequestsLimit = dto.AiRequestsLimit,
				DurationDays = dto.DurationDays,
				IsPopular = dto.IsPopular,
				ShowOnLanding = dto.ShowOnLanding,
				YearlyPrice = dto.YearlyPrice,
				YearlyDurationDays = dto.YearlyDurationDays
			};

			await _unitOfWork.Repository<Subscription>().AddAsync(entity);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("Subscription plan created: {Plan}", entity.Name);

			return ApiExceptionResponse.Success(new SubscriptionDto
			{
				Id = entity.Id,
				Name = entity.Name,
				Price = entity.Price,
				Features = entity.Features,
				AiRequestsLimit = entity.AiRequestsLimit ?? 0,
				DurationDays = entity.DurationDays,
				IsActive = entity.IsActive,
				IsPopular = entity.IsPopular,
				ShowOnLanding = entity.ShowOnLanding,
				YearlyPrice = entity.YearlyPrice,
				YearlyDurationDays = entity.YearlyDurationDays
			}, "Plan created successfully");
		}

		public async Task<Result<List<SubscriptionDto>>> GetAllPlansAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
		{
			var query = _unitOfWork.Repository<Subscription>()
				.AsQueryable()
				.AsNoTracking();

			if (!includeInactive)
			{
				query = query.Where(p => p.IsActive);
			}

			var plans = await query.ToListAsync(cancellationToken);

			var result = plans.Select(p => new SubscriptionDto
			{
				Id = p.Id,
				Name = p.Name,
				Price = p.Price,
				Features = p.Features,
				AiRequestsLimit = p.AiRequestsLimit ?? 0,
				DurationDays = p.DurationDays,
				IsActive = p.IsActive,
				IsPopular = p.IsPopular,
				ShowOnLanding = p.ShowOnLanding,
				YearlyPrice = p.YearlyPrice,
				YearlyDurationDays = p.YearlyDurationDays
			}).ToList();

			return ApiExceptionResponse.Success(result , "Plan returned successfully");
		}

		public async Task<Result<PaginatedResult<SubscriptionDto>>> GetAllPlansAsync(int pageNumber, int pageSize, CancellationToken cancellationToken)
		{
			var query = _unitOfWork.Repository<Subscription>()
				.AsQueryable()
				.AsNoTracking();

			var totalCount = await query.CountAsync(cancellationToken);
			var plans = await query
				.Skip((pageNumber - 1) * pageSize)
				.Take(pageSize)
				.ToListAsync(cancellationToken);

			var items = plans.Select(p => new SubscriptionDto
			{
				Id = p.Id,
				Name = p.Name,
				Price = p.Price,
				Features = p.Features,
				AiRequestsLimit = p.AiRequestsLimit ?? 0,
				DurationDays = p.DurationDays,
				IsActive = p.IsActive,
				IsPopular = p.IsPopular,
				ShowOnLanding = p.ShowOnLanding,
				YearlyPrice = p.YearlyPrice,
				YearlyDurationDays = p.YearlyDurationDays
			}).ToList();

			var paginatedResult = new PaginatedResult<SubscriptionDto>
			{
				Items = items,
				TotalCount = totalCount,
				Page = pageNumber,
				PageSize = pageSize
			};

			return ApiExceptionResponse.Success(paginatedResult, "Plans returned successfully");
		}

		public async Task<Result<LawyerSubscriptionDto>> SubscribeAsync(Guid lawyerId, int subscriptionId, string billingCycle, CancellationToken cancellationToken)
		{
			var plan = await _unitOfWork.Repository<Subscription>().GetByIdAsync(subscriptionId);
			if (plan == null)
				return ApiExceptionResponse.NotFound<LawyerSubscriptionDto>("Plan not found");

			var isYearly = billingCycle?.ToLower() == "yearly";

			if (isYearly && !plan.YearlyPrice.HasValue)
				return ApiExceptionResponse.BadRequest<LawyerSubscriptionDto>("Yearly billing is not available for this plan");

			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
				.FirstOrDefaultAsync(x=>x.Id==lawyerId , cancellationToken , x=>x.ApplicationUser);

			if (lawyer == null)
				return ApiExceptionResponse.NotFound<LawyerSubscriptionDto>("Lawyer not found");

			if (SubscriptionPlanClassifier.IsTrial(plan))
			{
				var existingTrialSub = await _unitOfWork.Repository<LawyerSubscription>()
					.AsQueryable()
					.IgnoreQueryFilters()
					.Include(ls => ls.Subscription)
					.FirstOrDefaultAsync(ls => ls.LawyerId == lawyerId && (ls.Subscription.Price <= 0 || ls.Subscription.Name == SubscriptionPlanClassifier.TrialPlanName || ls.Subscription.Name == SubscriptionPlanClassifier.LegacyTrialPlanName), cancellationToken);

				if (existingTrialSub != null)
				{
					return ApiExceptionResponse.BadRequest<LawyerSubscriptionDto>("لا يمكن الاشتراك في الباقة التجريبية أكثر من مرة.");
				}
			}

			var current = await _unitOfWork.Repository<LawyerSubscription>()
				.FirstOrDefaultAsync(x => x.LawyerId == lawyerId && x.IsActive, cancellationToken);

			if (current != null)
			{
				current.IsActive = false;
				await _unitOfWork.Repository<LawyerSubscription>().Update(current);
			}

			var durationDays = isYearly ? (plan.YearlyDurationDays ?? 365) : plan.DurationDays;

			var newSub = new LawyerSubscription
			{
				LawyerId = lawyerId,
				SubscriptionId = subscriptionId,
				UsedAiRequests = 0,
				StartDate = DateTime.UtcNow,
				EndDate = DateTime.UtcNow.AddDays(durationDays),
				IsActive = true
			};

			await _unitOfWork.Repository<LawyerSubscription>().AddAsync(newSub);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			if (!string.IsNullOrEmpty(lawyer.ApplicationUser?.Email))
			{
				var emailContent = $@"
                    <h2>تأكيد تفعيل الاشتراك 🌟</h2>
                    <p>مرحباً <strong>{lawyer.ApplicationUser.FullName}</strong>،</p>
                    <p>تم تفعيل اشتراكك في باقة <strong>{plan.Name}</strong> بنجاح.</p>
                    <p>نتمنى لك تجربة استثنائية مع محامي سمارت. إليك تفاصيل اشتراكك:</p>
                    <div style=""background-color: #FBFAE8; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid rgba(239, 149, 10, 0.2);"">
                        <div style=""margin-bottom: 12px;""><strong style=""color: #1B1B1B;"">اسم الباقة:</strong> {plan.Name}</div>
                        <div style=""margin-bottom: 12px;""><strong style=""color: #1B1B1B;"">تاريخ البدء:</strong> {newSub.StartDate:yyyy-MM-dd}</div>
                        <div style=""margin-bottom: 12px;""><strong style=""color: #1B1B1B;"">تاريخ الانتهاء:</strong> {newSub.EndDate:yyyy-MM-dd}</div>
                        <div style=""margin-bottom: 0;""><strong style=""color: #1B1B1B;"">رصيد الاستفسارات:</strong> {plan.AiRequestsLimit} استفسار</div>
                    </div>
                    <p>يمكنك الآن البدء في استخدام جميع مميزات الذكاء الاصطناعي المتاحة لك بحرية تامة.</p>
                ";

				await _emailService.SendEmailAsync(
					lawyer.ApplicationUser.Email,
					"تأكيد الاشتراك في الباقة - محامي سمارت",
					EmailTemplateBuilder.BuildEmailTemplate("تأكيد الاشتراك في الباقة", emailContent),
					"SubscriptionConfirmation",
					newSub.Id.ToString(),
                    lawyer.ApplicationUser.Id,
                    "subscription-confirmation",
                    "subscription-activation",
					cancellationToken);
			}

			var isTrial = SubscriptionPlanClassifier.IsTrial(plan);

			return ApiExceptionResponse.Success(new LawyerSubscriptionDto
			{
				LawyerId = lawyerId,
				LawyerName = lawyer.ApplicationUser?.FullName ?? string.Empty,
				PlanName = plan.Name,
				Price = plan.Price,
				IsTrial = isTrial,
				IsPaid = !isTrial,
				StartDate = newSub.StartDate,
				EndDate = newSub.EndDate,
				UsedAiRequests = newSub.UsedAiRequests,
				Limit = newSub.GetEffectiveAiRequestsLimit(),
				IsActive = true
			}, "Lawyer subscribed successfully");
		}

		public async Task<Result<LawyerSubscriptionDto>> GetLawyerPlanAsync(Guid lawyerId, CancellationToken cancellationToken)
		{
			var sub = await _unitOfWork.Repository<LawyerSubscription>()
				.FirstOrDefaultAsync(x => x.LawyerId == lawyerId && x.IsActive, cancellationToken ,x=>x.Subscription);

			if (sub == null)
				return ApiExceptionResponse.NotFound<LawyerSubscriptionDto>("No active subscription found");

			var isTrial = SubscriptionPlanClassifier.IsTrial(sub.Subscription);

			return ApiExceptionResponse.Success(new LawyerSubscriptionDto
			{
				LawyerId = lawyerId,
				PlanName = sub.Subscription.Name,
				Price = sub.Subscription.Price,
				IsTrial = isTrial,
				IsPaid = !isTrial,
				StartDate = sub.StartDate,
				EndDate = sub.EndDate,
				UsedAiRequests = await ResolveUsedAiRequestsAsync(sub, cancellationToken),
				Limit = sub.GetEffectiveAiRequestsLimit(),
				IsActive = sub.IsActive
			});
		}

		public async Task<Result<LawyerSubscriptionDto>> UpgradeSubscriptionAsync(Guid lawyerId, int newSubscriptionId, string billingCycle, CancellationToken cancellationToken)
		{
			var currentSub = await _unitOfWork.Repository<LawyerSubscription>()
				.FirstOrDefaultAsync(x => x.LawyerId == lawyerId && x.IsActive, cancellationToken, x => x.Subscription);

			if (currentSub == null)
				return ApiExceptionResponse.BadRequest<LawyerSubscriptionDto>("No active subscription to upgrade");

			var newPlan = await _unitOfWork.Repository<Subscription>().GetByIdAsync(newSubscriptionId);
			if (newPlan == null)
				return ApiExceptionResponse.NotFound<LawyerSubscriptionDto>("Plan not found");

			if (newPlan.Price <= currentSub.Subscription.Price)
				return ApiExceptionResponse.BadRequest<LawyerSubscriptionDto>("New plan must be higher than current plan");

			return await SubscribeAsync(lawyerId, newSubscriptionId, billingCycle, cancellationToken);
		}







		public async Task<Result<List<LawyerSubscriptionDto>>> GetLawyersPlanAsync(bool? isActive, bool? isPaid, CancellationToken cancellationToken)
		{
			IQueryable<LawyerSubscription> query = _unitOfWork.Repository<LawyerSubscription>()
				.AsQueryable()
				.AsNoTracking()
				.Include(x => x.Subscription);

			if (isActive.HasValue)
				query = query.Where(x => x.IsActive == isActive.Value);

			if (isPaid.HasValue)
			{
				query = isPaid.Value
					? query.Where(x => x.Subscription.Price > 0 && x.Subscription.Name != SubscriptionPlanClassifier.TrialPlanName && x.Subscription.Name != SubscriptionPlanClassifier.LegacyTrialPlanName)
					: query.Where(x => x.Subscription.Price <= 0 || x.Subscription.Name == SubscriptionPlanClassifier.TrialPlanName || x.Subscription.Name == SubscriptionPlanClassifier.LegacyTrialPlanName);
			}

			var subscriptions = await query
				.Include(x => x.Lawyer)
					.ThenInclude(l => l.ApplicationUser)
				.ToListAsync(cancellationToken);

			var result = subscriptions.Select(sub => new LawyerSubscriptionDto
			{
				LawyerId = sub.LawyerId,
				LawyerName = sub.Lawyer.ApplicationUser.FullName,
				PlanName = sub.Subscription.Name,
				Price = sub.Subscription.Price,
				IsTrial = SubscriptionPlanClassifier.IsTrial(sub.Subscription),
				IsPaid = SubscriptionPlanClassifier.IsPaid(sub.Subscription),
				StartDate = sub.StartDate,
				EndDate = sub.EndDate,
				UsedAiRequests = sub.UsedAiRequests,
				Limit = sub.GetEffectiveAiRequestsLimit(),
				IsActive = sub.IsActive
			}).ToList();

			return ApiExceptionResponse.Success(result, "Lawyers plans retrieved successfully");
		}

		private async Task<int> ResolveUsedAiRequestsAsync(LawyerSubscription subscription, CancellationToken cancellationToken)
		{
			var transactionGroups = await _unitOfWork.Repository<AiPointTransaction>()
				.AsQueryable()
				.AsNoTracking()
				.Where(t => t.LawyerSubscriptionId == subscription.Id)
				.GroupBy(t => t.TransactionType)
				.Select(g => new { Type = g.Key, Points = g.Sum(t => t.Points) })
				.ToListAsync(cancellationToken);

			if (transactionGroups.Count == 0)
			{
				return subscription.UsedAiRequests;
			}

			var charged = transactionGroups.FirstOrDefault(t => t.Type == AiPointTransactionType.Charge)?.Points ?? 0;
			var restored = transactionGroups.FirstOrDefault(t => t.Type == AiPointTransactionType.Restore)?.Points ?? 0;
			return Math.Max(0, charged - restored);
		}

		public async Task<bool> CheckAiRequestAvailability(Guid lawyerId, CancellationToken cancellationToken = default)
		{
			var subscription = await _unitOfWork.Repository<LawyerSubscription>()
				.FirstOrDefaultAsync(x => x.LawyerId == lawyerId && x.IsActive, cancellationToken , x=>x.Subscription);

			if (subscription == null)
				return false;

			// Expired plan check
			if (subscription.EndDate < DateTime.UtcNow)
			{
				subscription.IsActive = false;
				await _unitOfWork.Repository<LawyerSubscription>().Update(subscription);
				await _unitOfWork.SaveChangesAsync(cancellationToken);
				return false;
			}

			// Check available requests
			return subscription.UsedAiRequests < subscription.GetEffectiveAiRequestsLimit();
		}




		public async Task<Result<SubscriptionDto>> EditPlanAsync(int id, UpdateSubscriptionDto dto, CancellationToken cancellationToken)
		{
			var plan = await _unitOfWork.Repository<Subscription>().GetByIdAsync(id);
			if (plan == null)
				return ApiExceptionResponse.NotFound<SubscriptionDto>("Plan not found");

			if (dto.Name != null) plan.Name = dto.Name;
			if (dto.Features != null) plan.Features = dto.Features;
			if (dto.Price.HasValue) plan.Price = dto.Price.Value;
			if (dto.AiRequestsLimit.HasValue) plan.AiRequestsLimit = dto.AiRequestsLimit.Value;
			if (dto.DurationDays.HasValue) plan.DurationDays = dto.DurationDays.Value;
			if (dto.IsActive.HasValue) plan.IsActive = dto.IsActive.Value;
			if (dto.IsPopular.HasValue) plan.IsPopular = dto.IsPopular.Value;
			if (dto.ShowOnLanding.HasValue) plan.ShowOnLanding = dto.ShowOnLanding.Value;
			if (dto.YearlyPrice.HasValue) plan.YearlyPrice = dto.YearlyPrice.Value;
			if (dto.YearlyDurationDays.HasValue) plan.YearlyDurationDays = dto.YearlyDurationDays.Value;

			await _unitOfWork.Repository<Subscription>().Update(plan);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("Subscription plan updated: {Plan}", plan.Name);

			return ApiExceptionResponse.Success(new SubscriptionDto
			{
				Id = plan.Id,
				Name = plan.Name,
				Price = plan.Price,
				Features = plan.Features,
				AiRequestsLimit = plan.AiRequestsLimit ?? 0,
				DurationDays = plan.DurationDays,
				IsActive = plan.IsActive,
				IsPopular = plan.IsPopular,
				ShowOnLanding = plan.ShowOnLanding,
				YearlyPrice = plan.YearlyPrice,
				YearlyDurationDays = plan.YearlyDurationDays
			}, "Plan updated successfully");
		}

		public async Task<Result<LawyerSubscriptionDto>> EditLawyerSubscriptionAsync(Guid lawyerSubscriptionId, CancellationToken cancellationToken)
		{
			var sub = await _unitOfWork.Repository<LawyerSubscription>()
				.FirstOrDefaultAsync(x => x.Id == lawyerSubscriptionId, cancellationToken, x => x.Subscription, x => x.Lawyer);

			if (sub == null)
				return ApiExceptionResponse.NotFound<LawyerSubscriptionDto>("Lawyer subscription not found");

			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
				.FirstOrDefaultAsync(x => x.Id == sub.LawyerId, cancellationToken, x => x.ApplicationUser);

			sub.IsActive = !sub.IsActive;
			await _unitOfWork.Repository<LawyerSubscription>().Update(sub);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("Lawyer subscription {Id} toggled IsActive to {IsActive}", lawyerSubscriptionId, sub.IsActive);

			return ApiExceptionResponse.Success(new LawyerSubscriptionDto
			{
				LawyerId = sub.LawyerId,
				LawyerName = lawyer?.ApplicationUser?.FullName ?? string.Empty,
				PlanName = sub.Subscription.Name,
				StartDate = sub.StartDate,
				EndDate = sub.EndDate,
				UsedAiRequests = sub.UsedAiRequests,
				Limit = sub.GetEffectiveAiRequestsLimit(),
				IsActive = sub.IsActive
			}, $"Lawyer subscription {(sub.IsActive ? "activated" : "deactivated")} successfully");
		}

		public async Task<Result<string>> UseAiRequestAsync(Guid lawyerId, CancellationToken cancellationToken = default)
		{
			// Legacy pre-charge path. Chargeable AI job flows must use IAiPointAccountingService
			// so points are deducted only after a usable AI result is produced.
			var subscription = await _unitOfWork.Repository<LawyerSubscription>()
					.FirstOrDefaultAsync(x => x.LawyerId == lawyerId && x.IsActive, cancellationToken, x => x.Subscription);

			if (subscription == null)
				return ApiExceptionResponse.BadRequest<string>("No active subscription found. Please subscribe to a plan to use AI features.");

			if (subscription.EndDate < DateTime.UtcNow)
			{
				subscription.IsActive = false;
				await _unitOfWork.Repository<LawyerSubscription>().Update(subscription);
				await _unitOfWork.SaveChangesAsync(cancellationToken);
				return ApiExceptionResponse.BadRequest<string>("Your subscription has expired. Please subscribe again to continue using AI features.");
			}

			var limit = subscription.GetEffectiveAiRequestsLimit();

			var rowsAffected = await _unitOfWork.ExecuteSqlRawAsync(
				"UPDATE LawyerSubscription SET UsedAiRequests = UsedAiRequests + 1 WHERE LawyerId = {0} AND IsActive = 1 AND UsedAiRequests < {1}",
				new object[] { lawyerId, limit },
				cancellationToken);

			if (rowsAffected == 0)
				return ApiExceptionResponse.BadRequest<string>("Your AI usage limit has been reached for this plan. Please subscribe again to continue using AI features.");

			_logger.LogInformation("Lawyer {LawyerId} used an AI request. ({Used}/{Limit})",
				lawyerId, subscription.UsedAiRequests + 1, limit);

			return ApiExceptionResponse.Success("AI request recorded successfully.");
		}

		/// <summary>
		/// Archive a plan (soft-delete). Blocked if plan has any active lawyer subscriptions.
		/// </summary>
		public async Task<Result<bool>> ArchivePlanAsync(int planId, CancellationToken cancellationToken)
		{
			var plan = await _unitOfWork.Repository<Subscription>().GetByIdAsync(planId);
			if (plan == null)
				return ApiExceptionResponse.NotFound<bool>("Plan not found");

			if (!plan.IsActive)
				return ApiExceptionResponse.BadRequest<bool>("Plan is already archived");

			// We allow archiving the plan even if there are active subscribers.
			// This simply hides the plan from the store (IsActive = false)
			// while existing active LawyerSubscription records continue to function normally.

			plan.IsActive = false;
			await _unitOfWork.Repository<Subscription>().Update(plan);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("Subscription plan archived: {PlanId} - {PlanName}", planId, plan.Name);

			return ApiExceptionResponse.Success(true, "Plan archived successfully");
		}

		/// <summary>
		/// Restore an archived subscription plan (make it active again).
		/// </summary>
		public async Task<Result<bool>> RestorePlanAsync(int planId, CancellationToken cancellationToken)
		{
			var plan = await _unitOfWork.Repository<Subscription>().GetByIdAsync(planId);
			if (plan == null)
				return ApiExceptionResponse.NotFound<bool>("Plan not found");

			if (plan.IsActive)
				return ApiExceptionResponse.BadRequest<bool>("Plan is already active");

			plan.IsActive = true;
			await _unitOfWork.Repository<Subscription>().Update(plan);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("Subscription plan restored: {PlanId} - {PlanName}", planId, plan.Name);

			return ApiExceptionResponse.Success(true, "Plan restored successfully");
		}

		/// <summary>
		/// Background job task to find active lawyer subscriptions that have ended, and mark them inactive.
		/// </summary>
		public async Task<Result<int>> ExpireExpiredSubscriptionsAsync(CancellationToken cancellationToken = default)
		{
			var expiredSubscriptions = await _unitOfWork.Repository<LawyerSubscription>()
				.AsQueryable()
				.Where(s => s.IsActive && s.EndDate < DateTime.UtcNow)
				.ToListAsync(cancellationToken);

			if (expiredSubscriptions.Any())
			{
				foreach (var sub in expiredSubscriptions)
				{
					sub.IsActive = false;
					await _unitOfWork.Repository<LawyerSubscription>().Update(sub);
					_logger.LogInformation("Expired subscription for Lawyer {LawyerId}, Subscription {SubscriptionId}. End date was {EndDate}", sub.LawyerId, sub.SubscriptionId, sub.EndDate);
				}
				await _unitOfWork.SaveChangesAsync(cancellationToken);
			}

			return ApiExceptionResponse.Success(expiredSubscriptions.Count, $"{expiredSubscriptions.Count} expired subscriptions deactivated successfully.");
		}

		public async Task<Result<List<SubscriptionDto>>> GetLandingPlansAsync(CancellationToken cancellationToken)
		{
			var plans = await _unitOfWork.Repository<Subscription>()
				.AsQueryable()
				.AsNoTracking()
				.Where(p => p.ShowOnLanding && p.IsActive)
				.OrderBy(p => p.Price)
				.ToListAsync(cancellationToken);

			var result = plans.Select(p => new SubscriptionDto
			{
				Id = p.Id,
				Name = p.Name,
				Price = p.Price,
				Features = p.Features,
				AiRequestsLimit = p.AiRequestsLimit ?? 0,
				DurationDays = p.DurationDays,
				IsActive = p.IsActive,
				IsPopular = p.IsPopular,
				ShowOnLanding = p.ShowOnLanding,
				YearlyPrice = p.YearlyPrice,
				YearlyDurationDays = p.YearlyDurationDays
			}).ToList();

			return ApiExceptionResponse.Success(result, "Landing plans returned successfully");
		}

	}

}
