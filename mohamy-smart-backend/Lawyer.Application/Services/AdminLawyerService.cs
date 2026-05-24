using Lawyer.Application.Common.Interface;
using Lawyer.Application.Common;
using Lawyer.Application.Dtos.Lawyers;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Enum;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lawyer.Application.Services
{
	public class AdminLawyerService : IAdminLawyerService
	{
		private readonly IUnitOfWork _unitOfWork;
		private readonly ILogger<AdminLawyerService> _logger;
		private readonly IAuditService _audit;
		private readonly IUserContextProvider _userContextProvider;

		public AdminLawyerService(
			IUnitOfWork unitOfWork,
			ILogger<AdminLawyerService> logger,
			IAuditService audit,
			IUserContextProvider userContextProvider)
		{
			_unitOfWork = unitOfWork;
			_logger = logger;
			_audit = audit;
			_userContextProvider = userContextProvider;
		}

		public async Task<Result<AdminLawyerDetailDto>> GetLawyerDetailAsync(Guid userId, CancellationToken cancellationToken)
		{
			var user = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.AsNoTracking()
				.Include(u => u.Lawyer)
					.ThenInclude(l => l!.LawyerSubscriptions)
						.ThenInclude(ls => ls.Subscription)
				.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

			if (user == null)
				return ApiExceptionResponse.NotFound<AdminLawyerDetailDto>("Lawyer user not found.");

			if (user.Lawyer == null)
				return ApiExceptionResponse.NotFound<AdminLawyerDetailDto>("Lawyer profile not found.");

			var lawyer = user.Lawyer;
			var lawyerId = lawyer.Id;
			var lawyerIdText = lawyerId.ToString();

			var subscriptions = lawyer.LawyerSubscriptions
				.OrderByDescending(ls => ls.IsActive)
				.ThenByDescending(ls => ls.EndDate)
				.ToList();
			var currentSubscription = subscriptions.FirstOrDefault();
			var subscriptionUsageOverrides = await GetPointUsageBySubscriptionAsync(
				subscriptions.Select(s => s.Id).ToList(),
				cancellationToken);

			var casesQuery = _unitOfWork.Repository<Case>().AsQueryable()
				.AsNoTracking()
				.Where(c => c.LawyerId == lawyerId);
			var clientsQuery = _unitOfWork.Repository<Client>().AsQueryable()
				.AsNoTracking()
				.Where(c => c.LawyerId == lawyerId);
			var powersQuery = _unitOfWork.Repository<PowerOfAttorney>().AsQueryable()
				.AsNoTracking()
				.Where(p => p.LawyerId == lawyerId);
			var reviewsQuery = _unitOfWork.Repository<Review>().AsQueryable()
				.AsNoTracking()
				.Where(r => r.LawyerId == lawyerIdText);
			var aiUsageIds = new[] { lawyer.Id, lawyer.ApplicationUserId };
			var aiUsageQuery = _unitOfWork.Repository<AiUsageRecord>().AsQueryable()
				.AsNoTracking()
				.Where(a => aiUsageIds.Contains(a.LawyerId));

			var casesCount = await casesQuery.CountAsync(cancellationToken);
			var activeCasesCount = await casesQuery.CountAsync(c => c.IsActive, cancellationToken);
			var clientsCount = await clientsQuery.CountAsync(cancellationToken);
			var powersCount = await powersQuery.CountAsync(cancellationToken);
			var activePowersCount = await powersQuery.CountAsync(p => p.IsActive && !p.IsCanceled, cancellationToken);
			var reviewsCount = await reviewsQuery.CountAsync(cancellationToken);
			var approvedReviewsCount = await reviewsQuery.CountAsync(r => r.Status.ToLower() == "approved", cancellationToken);
			var pendingReviewsCount = await reviewsQuery.CountAsync(r => r.Status.ToLower() == "pending", cancellationToken);
			var averageReviewRating = reviewsCount > 0
				? Math.Round((decimal)await reviewsQuery.AverageAsync(r => r.Rating, cancellationToken), 2)
				: (decimal?)null;
			var aiUsageCount = await aiUsageQuery.CountAsync(cancellationToken);
			var aiRequestUsageCount = await aiUsageQuery.CountAsync(a => a.AiStepType != AiStepType.Ocr, cancellationToken);
			var ocrUsageCount = await aiUsageQuery.CountAsync(a => a.AiStepType == AiStepType.Ocr, cancellationToken);
			var aiTotalTokens = await aiUsageQuery.SumAsync(a => (long?)a.TotalTokens, cancellationToken) ?? 0;
			var aiEstimatedCost = await aiUsageQuery.SumAsync(a => (decimal?)a.EstimatedCostUsd, cancellationToken) ?? 0;

			var recentCases = await casesQuery
				.OrderByDescending(c => c.Created)
				.Take(5)
				.Select(c => new AdminLawyerRecentCaseDto
				{
					Id = c.Id,
					Title = c.Title,
					Number = c.Number,
					Court = c.Court,
					ClientName = c.ClientName,
					Status = c.Status,
					Created = c.Created,
					IsActive = c.IsActive
				})
				.ToListAsync(cancellationToken);

			var recentReviews = await reviewsQuery
				.OrderByDescending(r => r.Created)
				.Take(3)
				.Select(r => new AdminLawyerRecentReviewDto
				{
					Id = r.Id,
					ReviewerName = r.ReviewerName,
					ReviewerRole = r.ReviewerRole,
					Rating = r.Rating,
					Status = r.Status,
					Comment = r.Comment,
					Created = r.Created
				})
				.ToListAsync(cancellationToken);

			var recentAiUsage = await aiUsageQuery
				.OrderByDescending(a => a.CreatedAt)
				.Take(5)
				.Select(a => new AdminLawyerRecentAiUsageDto
				{
					Id = a.Id,
					CaseId = a.CaseId,
					AiStepType = a.AiStepType,
					Provider = a.Provider,
					ModelIdentifier = a.ModelIdentifier,
					TotalTokens = a.TotalTokens,
					EstimatedCostUsd = a.EstimatedCostUsd,
					CreatedAt = a.CreatedAt
				})
				.ToListAsync(cancellationToken);

			var lastActivityAt = await GetLastActivityAtAsync(
				casesQuery,
				clientsQuery,
				powersQuery,
				reviewsQuery,
				aiUsageQuery,
				user.CreatedAt,
				lawyer.Created,
				cancellationToken);

			var detail = new AdminLawyerDetailDto
			{
				Id = user.Id,
				LawyerId = lawyer.Id,
				FullName = user.FullName,
				Email = user.Email,
				PhoneNumber = user.PhoneNumber,
				IsActive = user.IsActive,
				PhoneNumberConfirmed = user.PhoneNumberConfirmed,
				EmailConfirmed = user.EmailConfirmed,
				UserType = user.UserType,
				CreatedAt = user.CreatedAt,
				Governorate = user.Governorate,
				AgreedToTerms = user.AgreedToTerms,
				BarNumber = lawyer.BarNumber,
				Specialization = lawyer.Specialization,
				ExperienceNumber = lawyer.ExperienceNumber,
				LawFirmName = lawyer.LawFirmName,
				BirthDate = lawyer.BirthDate,
				LawyerCreatedAt = lawyer.Created,
				LawyerProfileCreatedAt = lawyer.Created,
				SubscriptionPlanName = currentSubscription?.Subscription?.Name,
				SubscriptionIsActive = currentSubscription?.IsActive,
				NumberOfCases = casesCount,
				Subscription = currentSubscription != null ? MapSubscription(currentSubscription, subscriptionUsageOverrides) : null,
				RecentSubscriptions = subscriptions.Take(3).Select(s => MapSubscription(s, subscriptionUsageOverrides)).ToList(),
				RecentCases = recentCases,
				RecentReviews = recentReviews,
				RecentAiUsage = recentAiUsage,
				LatestManualPhoneVerification = await GetLatestManualPhoneVerificationAsync(user.Id, cancellationToken),
				Activity = new AdminLawyerActivitySummaryDto
				{
					CasesCount = casesCount,
					ActiveCasesCount = activeCasesCount,
					ClientsCount = clientsCount,
					PowersOfAttorneyCount = powersCount,
					ActivePowersOfAttorneyCount = activePowersCount,
					ReviewsCount = reviewsCount,
					ApprovedReviewsCount = approvedReviewsCount,
					PendingReviewsCount = pendingReviewsCount,
					AverageReviewRating = averageReviewRating,
					AiUsageCount = aiUsageCount,
					AiRequestUsageCount = aiRequestUsageCount,
					OcrUsageCount = ocrUsageCount,
					AiTotalTokens = aiTotalTokens,
					AiEstimatedCostUsd = aiEstimatedCost,
					LastActivityAt = lastActivityAt
				}
			};

			return ApiExceptionResponse.Success(detail, "Lawyer detail retrieved successfully.");
		}

		public async Task<Result<string>> UpdateLawyerStatusAsync(Guid lawyerId, bool isActive, CancellationToken cancellationToken)
		{
			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.Include(l => l.ApplicationUser)
				.FirstOrDefaultAsync(l => l.Id == lawyerId || l.ApplicationUserId == lawyerId, cancellationToken);

			if (lawyer == null)
				return ApiExceptionResponse.NotFound<string>("Lawyer not found");

			lawyer.IsActive = isActive;
			lawyer.Updated = DateTime.UtcNow;

			if (lawyer.ApplicationUser != null)
			{
				lawyer.ApplicationUser.IsActive = isActive;
			}

			if (isActive)
			{
				var hasActiveSubscription = await _unitOfWork.Repository<LawyerSubscription>()
					.AsQueryable()
					.AnyAsync(ls => ls.LawyerId == lawyer.Id && ls.IsActive, cancellationToken);

				if (!hasActiveSubscription)
				{
					const string trialPlanName = "الباقة التجريبية";
					const string legacyTrialPlanName = "Free Trial";

					var freeTrialPlan = await _unitOfWork.Repository<Subscription>()
						.FirstOrDefaultTrackedAsync(x => x.Name == trialPlanName || x.Name == legacyTrialPlanName, cancellationToken);

					if (freeTrialPlan == null)
					{
						freeTrialPlan = new Subscription
						{
							Name = trialPlanName,
							Price = 0,
							Features = "Basic Features",
							AiRequestsLimit = 10,
							DurationDays = 7,
							IsActive = true
						};
						await _unitOfWork.Repository<Subscription>().AddAsync(freeTrialPlan);
						_logger.LogInformation("Trial plan created automatically by admin service with 10 AI requests limit.");
					}
					else
					{
						bool updated = false;
						if (freeTrialPlan.Name == legacyTrialPlanName)
						{
							freeTrialPlan.Name = trialPlanName;
							updated = true;
						}
						if (freeTrialPlan.AiRequestsLimit == 1)
						{
							freeTrialPlan.AiRequestsLimit = 10;
							updated = true;
						}
						if (updated)
						{
							await _unitOfWork.Repository<Subscription>().Update(freeTrialPlan);
							_logger.LogInformation("Trial plan properties updated: name normalized or limit set to 10.");
						}
					}

					var existingTrialSub = await _unitOfWork.Repository<LawyerSubscription>()
						.AsQueryable()
						.IgnoreQueryFilters()
						.Include(ls => ls.Subscription)
						.FirstOrDefaultAsync(ls => ls.LawyerId == lawyer.Id && (ls.Subscription.Name == trialPlanName || ls.Subscription.Name == legacyTrialPlanName), cancellationToken);

					if (existingTrialSub != null)
					{
						_logger.LogInformation("Lawyer {LawyerId} already has an existing trial subscription record. Not subscribing again.", lawyer.Id);
					}
					else
					{
						var freeTrialSub = new LawyerSubscription
						{
							Lawyer = lawyer,
							LawyerId = lawyer.Id,
							Subscription = freeTrialPlan,
							SubscriptionId = freeTrialPlan.Id,
							UsedAiRequests = 0,
							StartDate = DateTime.UtcNow,
							EndDate = DateTime.UtcNow.AddDays(freeTrialPlan.DurationDays),
							IsActive = true
						};

						await _unitOfWork.Repository<LawyerSubscription>().AddAsync(freeTrialSub);
						_logger.LogInformation("Lawyer {LawyerId} automatically subscribed to trial plan upon first admin activation.", lawyer.Id);
					}
				}
			}

			await _unitOfWork.Repository<Core.Models.Lawyer>().Update(lawyer);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			var action = isActive ? "AdminActivatedLawyer" : "AdminSuspendedLawyer";
			_audit.Log(action, new { LawyerId = lawyerId });

			_logger.LogInformation("Lawyer {LawyerId} status updated to {IsActive}", lawyerId, isActive);

			return ApiExceptionResponse.Success("Lawyer status updated successfully", "Lawyer status updated successfully");
		}

		public async Task<Result<AdminPhoneVerificationResultDto>> VerifyPhoneManuallyAsync(
			Guid userId,
			AdminManualPhoneVerificationRequestDto dto,
			CancellationToken cancellationToken)
		{
			var currentUser = _userContextProvider.GetCurrentContext();
			if (!currentUser.IsAdmin || currentUser.UserId == Guid.Empty)
				return ApiExceptionResponse.Forbidden<AdminPhoneVerificationResultDto>("غير مصرح بتنفيذ توثيق الهاتف اليدوي.");

			var reason = dto?.Reason?.Trim() ?? string.Empty;
			if (string.IsNullOrWhiteSpace(reason))
				return ApiExceptionResponse.BadRequest<AdminPhoneVerificationResultDto>("سبب توثيق الهاتف اليدوي مطلوب.");

			if (reason.Length > 500)
				return ApiExceptionResponse.BadRequest<AdminPhoneVerificationResultDto>("سبب توثيق الهاتف اليدوي يجب ألا يتجاوز 500 حرف.");

			var user = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.Include(u => u.Lawyer)
				.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

			if (user == null)
				return ApiExceptionResponse.NotFound<AdminPhoneVerificationResultDto>("Lawyer user not found.");

			if (user.Lawyer == null)
				return ApiExceptionResponse.NotFound<AdminPhoneVerificationResultDto>("Lawyer profile not found.");

			if (string.IsNullOrWhiteSpace(user.PhoneNumber))
				return ApiExceptionResponse.BadRequest<AdminPhoneVerificationResultDto>("لا يوجد رقم هاتف محفوظ لهذا المستخدم.");

			if (user.PhoneNumberConfirmed)
				return ApiExceptionResponse.BadRequest<AdminPhoneVerificationResultDto>("رقم الهاتف موثق بالفعل.");

			var now = DateTime.UtcNow;
			user.PhoneNumberConfirmed = true;

			var audit = new ManualPhoneVerificationAudit
			{
				Id = Guid.NewGuid(),
				UserId = user.Id,
				PhoneNumber = user.PhoneNumber,
				VerifiedByAdminId = currentUser.UserId,
				Reason = reason,
				Created = now,
				CreatedBy = currentUser.UserId,
				Updated = now,
				UpdatedBy = currentUser.UserId,
				IsActive = true
			};

			await _unitOfWork.Repository<ManualPhoneVerificationAudit>().AddAsync(audit);
			await _unitOfWork.Repository<ApplicationUser>().Update(user);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			audit.VerifiedByAdmin = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.AsNoTracking()
				.FirstOrDefaultAsync(u => u.Id == currentUser.UserId, cancellationToken);

			_audit.Log("AdminManuallyVerifiedPhone", new
			{
				TargetUserId = user.Id,
				user.PhoneNumber,
				VerifiedByAdminId = currentUser.UserId,
				Reason = reason
			});

			_logger.LogInformation(
				"Admin {AdminId} manually verified phone for user {UserId}",
				currentUser.UserId,
				user.Id);

			var result = new AdminPhoneVerificationResultDto
			{
				Id = user.Id,
				PhoneNumber = user.PhoneNumber,
				PhoneNumberConfirmed = user.PhoneNumberConfirmed,
				LatestManualPhoneVerification = MapManualPhoneVerificationAudit(audit)
			};

			return ApiExceptionResponse.Success(result, "تم توثيق رقم الهاتف يدويًا.");
		}

		private static AdminLawyerSubscriptionSummaryDto MapSubscription(
			LawyerSubscription subscription,
			IReadOnlyDictionary<Guid, int>? usageOverrides = null)
		{
			return new AdminLawyerSubscriptionSummaryDto
			{
				Id = subscription.Id,
				PlanName = subscription.Subscription?.Name,
				IsActive = subscription.IsActive,
				StartDate = subscription.StartDate,
				EndDate = subscription.EndDate,
				DurationDays = subscription.Subscription?.DurationDays ?? 0,
				AiRequestsLimit = subscription.Subscription?.AiRequestsLimit,
				UsedAiRequests = usageOverrides != null && usageOverrides.TryGetValue(subscription.Id, out var usedFromTransactions)
					? usedFromTransactions
					: subscription.UsedAiRequests,
				Price = subscription.Subscription?.Price ?? 0,
				YearlyPrice = subscription.Subscription?.YearlyPrice
			};
		}

		private async Task<Dictionary<Guid, int>> GetPointUsageBySubscriptionAsync(
			IReadOnlyCollection<Guid> subscriptionIds,
			CancellationToken cancellationToken)
		{
			if (subscriptionIds.Count == 0)
			{
				return new Dictionary<Guid, int>();
			}

			var transactionGroups = await _unitOfWork.Repository<AiPointTransaction>()
				.AsQueryable()
				.AsNoTracking()
				.Where(t => subscriptionIds.Contains(t.LawyerSubscriptionId))
				.GroupBy(t => new { t.LawyerSubscriptionId, t.TransactionType })
				.Select(g => new
				{
					g.Key.LawyerSubscriptionId,
					g.Key.TransactionType,
					Points = g.Sum(t => t.Points)
				})
				.ToListAsync(cancellationToken);

			return transactionGroups
				.GroupBy(t => t.LawyerSubscriptionId)
				.ToDictionary(
					g => g.Key,
					g =>
					{
						var charged = g.FirstOrDefault(t => t.TransactionType == AiPointTransactionType.Charge)?.Points ?? 0;
						var restored = g.FirstOrDefault(t => t.TransactionType == AiPointTransactionType.Restore)?.Points ?? 0;
						return Math.Max(0, charged - restored);
					});
		}

		private async Task<AdminManualPhoneVerificationAuditDto?> GetLatestManualPhoneVerificationAsync(Guid userId, CancellationToken cancellationToken)
		{
			var audit = await _unitOfWork.Repository<ManualPhoneVerificationAudit>()
				.AsQueryable()
				.AsNoTracking()
				.Include(a => a.VerifiedByAdmin)
				.Where(a => a.UserId == userId)
				.OrderByDescending(a => a.Created)
				.ThenByDescending(a => a.Id)
				.FirstOrDefaultAsync(cancellationToken);

			return audit == null ? null : MapManualPhoneVerificationAudit(audit);
		}

		private static AdminManualPhoneVerificationAuditDto MapManualPhoneVerificationAudit(ManualPhoneVerificationAudit audit)
		{
			return new AdminManualPhoneVerificationAuditDto
			{
				Id = audit.Id,
				PhoneNumber = audit.PhoneNumber,
				Reason = audit.Reason,
				VerifiedByAdminId = audit.VerifiedByAdminId,
				VerifiedByAdminName = audit.VerifiedByAdmin?.FullName,
				CreatedAt = audit.Created
			};
		}

		private static async Task<DateTime?> GetLastActivityAtAsync(
			IQueryable<Case> casesQuery,
			IQueryable<Client> clientsQuery,
			IQueryable<PowerOfAttorney> powersQuery,
			IQueryable<Review> reviewsQuery,
			IQueryable<AiUsageRecord> aiUsageQuery,
			DateTime userCreatedAt,
			DateTime lawyerCreatedAt,
			CancellationToken cancellationToken)
		{
			var dates = new List<DateTime?> { userCreatedAt, lawyerCreatedAt };

			dates.Add(await casesQuery.Select(c => (DateTime?)c.Created).MaxAsync(cancellationToken));
			dates.Add(await clientsQuery.Select(c => (DateTime?)c.Created).MaxAsync(cancellationToken));
			dates.Add(await powersQuery.Select(p => (DateTime?)p.Created).MaxAsync(cancellationToken));
			dates.Add(await reviewsQuery.Select(r => (DateTime?)r.Created).MaxAsync(cancellationToken));
			dates.Add(await aiUsageQuery.Select(a => (DateTime?)a.CreatedAt).MaxAsync(cancellationToken));

			return dates.Where(d => d.HasValue).Max();
		}
	}
}
