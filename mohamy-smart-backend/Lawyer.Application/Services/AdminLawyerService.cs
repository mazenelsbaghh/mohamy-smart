using Lawyer.Application.Common.Interface;
using Lawyer.Application.Common;
using Lawyer.Application.Dtos.Admin;
using Lawyer.Application.Dtos.Lawyers;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Enum;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Lawyer.Application.Services.Workflows;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Lawyer.Application.Services
{
	public class AdminLawyerService : IAdminLawyerService
	{
		private readonly IUnitOfWork _unitOfWork;
		private readonly ILogger<AdminLawyerService> _logger;
		private readonly IAuditService _audit;
		private readonly IUserContextProvider _userContextProvider;
		private readonly UserManager<ApplicationUser> _userManager;

		public AdminLawyerService(
			IUnitOfWork unitOfWork,
			ILogger<AdminLawyerService> logger,
			IAuditService audit,
			IUserContextProvider userContextProvider,
			UserManager<ApplicationUser> userManager)
		{
			_unitOfWork = unitOfWork;
			_logger = logger;
			_audit = audit;
			_userContextProvider = userContextProvider;
			_userManager = userManager;
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

			var recentCaseWorkflowLookup = await GetCaseWorkflowLookupAsync(
				recentCases.Select(c => c.Id).ToList(),
				aiUsageIds,
				cancellationToken);

			foreach (var recentCase in recentCases)
			{
				if (recentCaseWorkflowLookup.TryGetValue(recentCase.Id, out var workflows))
					recentCase.Workflows = workflows;
			}

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

		public async Task<Result<AdjustAiPointsResultDto>> AdjustAiPointsAsync(Guid userId, int amount, CancellationToken cancellationToken)
		{
			var user = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.Include(u => u.Lawyer)
				.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

			if (user == null)
				return ApiExceptionResponse.NotFound<AdjustAiPointsResultDto>("Lawyer user not found.");

			if (user.Lawyer == null)
				return ApiExceptionResponse.NotFound<AdjustAiPointsResultDto>("Lawyer profile not found.");

			var lawyerSubscription = await _unitOfWork.Repository<LawyerSubscription>()
				.AsQueryable()
				.Include(ls => ls.Subscription)
				.FirstOrDefaultAsync(ls => ls.LawyerId == user.Lawyer.Id && ls.IsActive, cancellationToken);

			if (lawyerSubscription == null)
				return ApiExceptionResponse.BadRequest<AdjustAiPointsResultDto>("لا يوجد اشتراك نشط لهذا المحامي");

			var aiRequestsLimit = lawyerSubscription.Subscription.AiRequestsLimit ?? 0;
			var currentRemaining = aiRequestsLimit - lawyerSubscription.UsedAiRequests;
			var newRemaining = currentRemaining + amount;

			if (newRemaining < 0)
				return ApiExceptionResponse.BadRequest<AdjustAiPointsResultDto>("لا يمكن أن يكون الرصيد أقل من صفر");

			var newLimit = aiRequestsLimit;
			if (newRemaining > aiRequestsLimit)
			{
				newLimit = newRemaining;
				lawyerSubscription.Subscription.AiRequestsLimit = newLimit;
				await _unitOfWork.Repository<Subscription>().Update(lawyerSubscription.Subscription);
			}

			var newUsed = newLimit - newRemaining;
			lawyerSubscription.UsedAiRequests = newUsed;
			await _unitOfWork.Repository<LawyerSubscription>().Update(lawyerSubscription);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_audit.Log("AdminAdjustedAiPoints", new
			{
				UserId = userId,
				LawyerId = user.Lawyer.Id,
				Amount = amount,
				NewRemaining = newRemaining,
				NewUsed = newUsed,
				NewLimit = newLimit
			});

			_logger.LogInformation(
				"Admin adjusted AI points for user {UserId}: amount={Amount}, remaining={Remaining}, used={Used}, limit={Limit}",
				userId, amount, newRemaining, newUsed, newLimit);

			return ApiExceptionResponse.Success(new AdjustAiPointsResultDto
			{
				Remaining = newRemaining,
				Used = newUsed,
				Limit = newLimit
			}, "تم تعديل نقاط الذكاء الاصطناعي بنجاح.");
		}

		public async Task<Result<string>> AdminResetPasswordAsync(Guid userId, string newPassword, CancellationToken cancellationToken)
		{
			if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 8)
				return ApiExceptionResponse.BadRequest<string>("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");

			var user = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

			if (user == null)
				return ApiExceptionResponse.NotFound<string>("المستخدم غير موجود.");

			var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
			var resetResult = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);

			if (!resetResult.Succeeded)
			{
				var errors = string.Join("، ", resetResult.Errors.Select(e => e.Description));
				_logger.LogWarning("Admin password reset failed for user {UserId}: {Errors}", userId, errors);
				return ApiExceptionResponse.BadRequest<string>($"تعذر تغيير كلمة المرور: {errors}");
			}

			user.RefreshToken = null;
			user.RefreshTokenExpiresAt = null;
			await _unitOfWork.Repository<ApplicationUser>().Update(user);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_audit.Log("AdminResetPassword", new { TargetUserId = userId });

			_logger.LogInformation("Admin reset password for user {UserId}", userId);

			return ApiExceptionResponse.Success("تم تغيير كلمة المرور بنجاح.", "تم تغيير كلمة المرور بنجاح.");
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

		private async Task<Dictionary<Guid, List<AdminLawyerCaseWorkflowDto>>> GetCaseWorkflowLookupAsync(
			IReadOnlyCollection<Guid> caseIds,
			IReadOnlyCollection<Guid> aiUsageIds,
			CancellationToken cancellationToken)
		{
			if (caseIds.Count == 0)
			{
				return new Dictionary<Guid, List<AdminLawyerCaseWorkflowDto>>();
			}

			var pipelines = PipelineRegistry.GetAll().ToList();
			var pipelineByStep = pipelines
				.SelectMany(p => p.Steps.Select((s, index) => new PipelineStepLookup(
					s.StepType,
					s.DisplayName,
					p.Id,
					p.Name,
					index + 1)))
				.GroupBy(x => x.StepType)
				.ToDictionary(g => g.Key, g => g.First());

			var jobs = await _unitOfWork.Repository<AiJob>()
				.AsQueryable()
				.AsNoTracking()
				.Where(j => caseIds.Contains(j.CaseId))
				.OrderByDescending(j => j.CreatedAt)
				.ToListAsync(cancellationToken);

			if (jobs.Count == 0)
			{
				return new Dictionary<Guid, List<AdminLawyerCaseWorkflowDto>>();
			}

			var usageRecords = await _unitOfWork.Repository<AiUsageRecord>()
				.AsQueryable()
				.AsNoTracking()
				.Where(a => a.CaseId.HasValue && caseIds.Contains(a.CaseId.Value) && aiUsageIds.Contains(a.LawyerId))
				.ToListAsync(cancellationToken);

			var usageLookup = usageRecords
				.GroupBy(a => new
				{
					CaseId = a.CaseId!.Value,
					a.AiStepType,
					RunId = a.WorkflowRunId ?? string.Empty
				})
				.ToDictionary(
					g => g.Key,
					g => new
					{
						Tokens = g.Sum(a => a.TotalTokens),
						Cost = g.Sum(a => a.EstimatedCostUsd),
						Model = string.Join("، ", g.Select(a => a.ModelIdentifier).Where(m => !string.IsNullOrWhiteSpace(m)).Distinct())
					});

			return jobs
				.GroupBy(j => j.CaseId)
				.ToDictionary(
					caseGroup => caseGroup.Key,
					caseGroup => caseGroup
						.Select(job =>
						{
							pipelineByStep.TryGetValue(job.StepType, out var pipeline);
							var workflowKey = !string.IsNullOrWhiteSpace(job.WorkflowType)
								? job.WorkflowType!
								: pipeline?.WorkflowKey ?? job.StepType.ToString();
							var workflowName = pipeline?.WorkflowName ?? workflowKey;

							return new { Job = job, WorkflowKey = workflowKey, WorkflowName = workflowName };
						})
						.GroupBy(x => new { x.WorkflowKey, x.WorkflowName, RunId = x.Job.RunId ?? string.Empty })
						.Select(workflowGroup =>
						{
							var steps = workflowGroup
								.OrderBy(x => x.Job.StepNumber ?? GetStepOrder(x.Job.StepType, pipelineByStep))
								.ThenBy(x => x.Job.CreatedAt)
								.Select(x =>
								{
									pipelineByStep.TryGetValue(x.Job.StepType, out var pipeline);
									var usageKey = new
									{
										CaseId = x.Job.CaseId,
										AiStepType = x.Job.StepType,
										RunId = x.Job.RunId ?? string.Empty
									};
									usageLookup.TryGetValue(usageKey, out var usage);

									return new AdminLawyerCaseWorkflowStepDto
									{
										StepType = x.Job.StepType,
										StepName = pipeline?.StepName ?? x.Job.StepType.ToString(),
										Status = x.Job.Status.ToString(),
										ModelIdentifier = usage?.Model,
										TotalTokens = usage?.Tokens ?? 0,
										EstimatedCostUsd = usage?.Cost ?? 0,
										CreatedAt = x.Job.CreatedAt,
										CompletedAt = x.Job.CompletedAt,
										HasOutput = !string.IsNullOrWhiteSpace(x.Job.ResultJson),
										ResultPreview = BuildResultPreview(x.Job.ResultJson),
										ErrorMessage = x.Job.ErrorMessage
									};
								})
								.ToList();

							return new AdminLawyerCaseWorkflowDto
							{
								WorkflowKey = workflowGroup.Key.WorkflowKey,
								WorkflowName = workflowGroup.Key.WorkflowName,
								WorkflowRunId = string.IsNullOrWhiteSpace(workflowGroup.Key.RunId) ? null : workflowGroup.Key.RunId,
								RequestCount = steps.Count,
								CompletedSteps = steps.Count(s => string.Equals(s.Status, AiJobStatus.Completed.ToString(), StringComparison.OrdinalIgnoreCase)),
								FailedSteps = steps.Count(s => string.Equals(s.Status, AiJobStatus.Failed.ToString(), StringComparison.OrdinalIgnoreCase)),
								TotalCostUsd = steps.Sum(s => s.EstimatedCostUsd),
								TotalTokens = steps.Sum(s => s.TotalTokens),
								Steps = steps
							};
						})
						.OrderByDescending(w => w.TotalCostUsd)
						.ThenBy(w => w.WorkflowName)
						.ToList());
		}

		private static int GetStepOrder(
			AiStepType stepType,
			IReadOnlyDictionary<AiStepType, PipelineStepLookup> pipelineByStep)
		{
			return pipelineByStep.TryGetValue(stepType, out var pipeline) ? pipeline.StepNumber : (int)stepType;
		}

		private sealed record PipelineStepLookup(
			AiStepType StepType,
			string StepName,
			string WorkflowKey,
			string WorkflowName,
			int StepNumber);

		private static string? BuildResultPreview(string? resultJson)
		{
			if (string.IsNullOrWhiteSpace(resultJson))
				return null;

			var trimmed = resultJson.Trim();
			try
			{
				using var document = JsonDocument.Parse(trimmed);
				var lines = new List<string>();
				CollectPreviewLines(document.RootElement, lines);
				trimmed = lines.Count > 0
					? string.Join("\n", lines.Take(10))
					: JsonSerializer.Serialize(document.RootElement, JsonOptions.Serialize);
			}
			catch (JsonException)
			{
				trimmed = DecodeEscapedText(trimmed);
			}

			return trimmed.Length <= 700 ? trimmed : $"{trimmed[..700]}...";
		}

		private static void CollectPreviewLines(JsonElement element, List<string> lines, string? label = null)
		{
			if (lines.Count >= 12)
				return;

			switch (element.ValueKind)
			{
				case JsonValueKind.Object:
					foreach (var property in element.EnumerateObject())
					{
						if (ShouldSkipPreviewField(property.Name))
							continue;

						CollectPreviewLines(property.Value, lines, ToPreviewLabel(property.Name));
						if (lines.Count >= 12)
							break;
					}
					break;

				case JsonValueKind.Array:
					var primitiveItems = element.EnumerateArray()
						.Where(item => item.ValueKind is JsonValueKind.String or JsonValueKind.Number or JsonValueKind.True or JsonValueKind.False)
						.Select(ToPreviewValue)
						.Where(value => !string.IsNullOrWhiteSpace(value))
						.Take(4)
						.ToList();

					if (primitiveItems.Count > 0)
					{
						AddPreviewLine(lines, label, string.Join("، ", primitiveItems));
						break;
					}

					var index = 1;
					foreach (var item in element.EnumerateArray().Take(3))
					{
						CollectPreviewLines(item, lines, label == null ? $"عنصر {index}" : $"{label} {index}");
						index++;
						if (lines.Count >= 12)
							break;
					}
					break;

				case JsonValueKind.String:
				case JsonValueKind.Number:
				case JsonValueKind.True:
				case JsonValueKind.False:
					AddPreviewLine(lines, label, ToPreviewValue(element));
					break;
			}
		}

		private static void AddPreviewLine(List<string> lines, string? label, string value)
		{
			if (string.IsNullOrWhiteSpace(value))
				return;

			var cleanValue = DecodeEscapedText(value).Trim();
			if (cleanValue.Length > 180)
				cleanValue = $"{cleanValue[..180]}...";

			lines.Add(string.IsNullOrWhiteSpace(label) ? cleanValue : $"{label}: {cleanValue}");
		}

		private static string ToPreviewValue(JsonElement element) => element.ValueKind switch
		{
			JsonValueKind.String => element.GetString() ?? string.Empty,
			JsonValueKind.Number => element.GetRawText(),
			JsonValueKind.True => "نعم",
			JsonValueKind.False => "لا",
			_ => string.Empty
		};

		private static bool ShouldSkipPreviewField(string name)
		{
			var normalized = name.Replace("_", "", StringComparison.Ordinal).ToLowerInvariant();
			return normalized is "id" or "caseid" or "defenseid" or "clientdefenseid" or "workflowid" or "runid";
		}

		private static string ToPreviewLabel(string name)
		{
			return name switch
			{
				"case_number" or "caseNumber" => "رقم القضية",
				"court_name" or "courtName" => "المحكمة",
				"legal_facts_summary" or "legalFactsSummary" => "ملخص الوقائع",
				"defenseTitle" or "defense_title" or "title" => "العنوان",
				"legalBasis" or "legal_basis" => "السند القانوني",
				"reasoning" => "التسبيب",
				"basisFromCase" or "basis_from_case" => "أساسه من القضية",
				"recommendation" => "التوصية",
				"requests" => "الطلبات",
				"facts" => "الوقائع",
				"description" => "الوصف",
				"type" => "النوع",
				"court" => "المحكمة",
				"clientName" or "client_name" => "الموكل",
				"opponentName" or "opponent_name" => "الخصم",
				_ => SplitIdentifier(name)
			};
		}

		private static string SplitIdentifier(string name)
		{
			var spaced = Regex.Replace(name.Replace("_", " ", StringComparison.Ordinal), "([a-z])([A-Z])", "$1 $2");
			return spaced.Trim();
		}

		private static string DecodeEscapedText(string value)
		{
			try
			{
				return Regex.Unescape(value);
			}
			catch
			{
				return value;
			}
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
