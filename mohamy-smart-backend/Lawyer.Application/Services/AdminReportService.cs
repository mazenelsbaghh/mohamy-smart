using Lawyer.Application.Dtos.AdminReport;
using Lawyer.Application.IServices;
using Lawyer.Core.Enum;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Globalization;

namespace Lawyer.Application.Services
{
	public class AdminReportService : IAdminReportService
	{
		private readonly IUnitOfWork _unitOfWork;
		private readonly ILogger<AdminReportService> _logger;

		public AdminReportService(IUnitOfWork unitOfWork, ILogger<AdminReportService> logger)
		{
			_unitOfWork = unitOfWork;
			_logger = logger;
		}

	public async Task<Result<LawyersReportDto>> GetLawyersReportAsync(CancellationToken cancellationToken)
	{
		var query = _unitOfWork.Repository<Core.Models.Lawyer>()
			.AsQueryable()
			.AsNoTracking()
			.Include(l => l.ApplicationUser);

		var total = await query.CountAsync(cancellationToken);
		var active = await query.CountAsync(l => l.IsActive, cancellationToken);

		var recentRegistrations = await query
			.OrderByDescending(l => l.Created)
			.Take(10)
			.Select(l => new RecentLawyerDto
			{
				Id = l.Id,
				Name = l.ApplicationUser.FullName,
				JoinedAt = l.Created
			})
			.ToListAsync(cancellationToken);

		var now = DateTime.UtcNow;

		var activeSubscribers = await _unitOfWork.Repository<LawyerSubscription>()
			.AsQueryable()
			.AsNoTracking()
			.Where(s => s.IsActive && s.EndDate >= now)
			.Select(s => s.LawyerId)
			.Distinct()
			.CountAsync(cancellationToken);

		var activePaidSubscribers = await _unitOfWork.Repository<LawyerSubscription>()
			.AsQueryable()
			.AsNoTracking()
			.Where(s => s.IsActive && s.EndDate >= now && s.Subscription.Price > 0)
			.Select(s => s.LawyerId)
			.Distinct()
			.CountAsync(cancellationToken);

		var totalSubscribers = await _unitOfWork.Repository<LawyerSubscription>()
			.AsQueryable()
			.AsNoTracking()
			.Select(s => s.LawyerId)
			.Distinct()
			.CountAsync(cancellationToken);

		var expiredSubscribers = totalSubscribers - activeSubscribers;
		if (expiredSubscribers < 0) expiredSubscribers = 0;

		var dto = new LawyersReportDto
		{
			TotalLawyers = total,
			TotalActive = active,
			TotalInactive = total - active,
			ActiveSubscribers = activeSubscribers,
			ActivePaidSubscribers = activePaidSubscribers,
			ExpiredSubscribers = expiredSubscribers,
			RecentRegistrations = recentRegistrations
		};

		_logger.LogInformation("Lawyers report generated: Total={Total}, Active={Active}, ActiveSubscribers={ActiveSubscribers}, ActivePaidSubscribers={ActivePaidSubscribers}, ExpiredSubscribers={ExpiredSubscribers}", 
			total, active, activeSubscribers, activePaidSubscribers, expiredSubscribers);

		return ApiExceptionResponse.Success(dto, "Lawyers report generated successfully");
	}

	public async Task<Result<SubscriptionsReportDto>> GetSubscriptionsReportAsync(int pageNumber, int pageSize, CancellationToken cancellationToken)
	{
		var query = _unitOfWork.Repository<LawyerSubscription>()
			.AsQueryable()
			.AsNoTracking()
			.Include(x => x.Subscription);

		var subscriptions = await query.ToListAsync(cancellationToken);

		var total = subscriptions.Count;
		var active = subscriptions.Count(s => s.IsActive);

		var countPerPlan = subscriptions
			.GroupBy(s => s.Subscription.Name)
			.Select(g => new PlanCountDto
			{
				PlanName = g.Key,
				Count = g.Count()
			})
			.ToList();

		var paymentQuery = _unitOfWork.Repository<Payment>()
			.AsQueryable()
			.AsNoTracking()
			.Where(p => p.Status == PaymentStatus.Success);

		var totalRevenue = await paymentQuery.SumAsync(p => p.Amount, cancellationToken);
		var churned = subscriptions.Count(s => !s.IsActive);
		
		var totalPaymentsCount = await paymentQuery.CountAsync(cancellationToken);
		
		var payments = await paymentQuery
			.OrderByDescending(p => p.Created)
			.Skip((pageNumber - 1) * pageSize)
			.Take(pageSize)
			.ToListAsync(cancellationToken);

		var ledgerList = payments.Select(p => new SubscriptionLedgerDto
		{
			TransactionId = p.TransactionId,
			Amount = p.Amount,
			Date = p.Created,
			Status = p.Status.ToString()
		}).ToList();
		
		var pagedLedger = new Lawyer.Application.Models.PaginatedList<SubscriptionLedgerDto>(ledgerList, totalPaymentsCount, pageNumber, pageSize);

		var dto = new SubscriptionsReportDto
		{
			TotalSubscriptions = total,
			TotalActive = active,
			TotalInactive = total - active,
			CountPerPlan = countPerPlan,
			TotalRevenue = totalRevenue,
			ChurnedSubscriptions = churned,
			Ledger = pagedLedger
		};

		_logger.LogInformation("Subscriptions report generated: Total={Total}, Active={Active}, Revenue={Revenue}", total, active, totalRevenue);

		return ApiExceptionResponse.Success(dto, "Subscriptions report generated successfully");
	}

		public async Task<Result<AccountMessagingAuditDto>> GetAccountMessagingAuditAsync(CancellationToken cancellationToken)
		{
			var otpQuery = _unitOfWork.Repository<Otp>()
				.AsQueryable()
				.AsNoTracking()
				.Include(o => o.User);

			var recentOtps = await otpQuery.OrderByDescending(o => o.Created).Take(100).ToListAsync(cancellationToken);

			var emailQuery = _unitOfWork.Repository<AccountEmailEvent>()
				.AsQueryable()
				.AsNoTracking()
				.Include(e => e.User);

			var recentEmails = await emailQuery.OrderByDescending(e => e.SentAtUtc ?? DateTime.MinValue).Take(100).ToListAsync(cancellationToken);

			var otpBaseQuery = _unitOfWork.Repository<Otp>()
				.AsQueryable()
				.AsNoTracking();

			var emailBaseQuery = _unitOfWork.Repository<AccountEmailEvent>()
				.AsQueryable()
				.AsNoTracking();

			var dto = new AccountMessagingAuditDto
			{
				TotalOtpIssued = await otpBaseQuery.CountAsync(cancellationToken),
				TotalOtpVerified = await otpBaseQuery.CountAsync(o => o.ConsumedAtUtc != null && o.IsVerified, cancellationToken),
				TotalOtpFailed = await otpBaseQuery.CountAsync(o => o.InvalidatedAtUtc != null, cancellationToken),
				TotalOtpLockedOut = await otpBaseQuery.CountAsync(o => o.FailureReason == "AttemptLimitExceeded", cancellationToken),
				TotalEmailsSent = await emailBaseQuery.CountAsync(e => e.DeliveryStatus == "Sent", cancellationToken),
				TotalEmailsFailed = await emailBaseQuery.CountAsync(e => e.DeliveryStatus == "Failed", cancellationToken),
				RecentOtpEvents = recentOtps.Select(o => new OtpAuditEntryDto
				{
					Id = o.Id,
					UserName = o.User?.FullName ?? string.Empty,
					Purpose = o.Type.ToString(),
					DeliveryChannel = o.DeliveryChannel,
					MaskedDestination = o.MaskedDestination,
					Status = o.ConsumedAtUtc != null ? "Consumed"
						: o.InvalidatedAtUtc != null ? "Invalidated"
						: o.ExpirationDate < DateTime.UtcNow ? "Expired"
						: "Active",
					AttemptCount = o.AttemptCount,
					IssuedAtUtc = o.Created,
					ConsumedAtUtc = o.ConsumedAtUtc,
					FailureReason = o.FailureReason
				}).ToList(),
				RecentEmailEvents = recentEmails.Select(e => new EmailAuditEntryDto
				{
					Id = e.Id,
					RecipientEmail = e.RecipientEmail,
					EventType = e.EventType,
					DeliveryStatus = e.DeliveryStatus,
					SentAtUtc = e.SentAtUtc,
					FailureReasonCategory = e.FailureReasonCategory,
					TriggeredBy = e.TriggeredBy
				}).ToList()
			};

			_logger.LogInformation("Account messaging audit generated: OTPs={TotalOtps}, Emails={TotalEmails}", dto.TotalOtpIssued, dto.TotalEmailsSent + dto.TotalEmailsFailed);

			return ApiExceptionResponse.Success(dto, "Account messaging audit generated successfully");
		}

		public async Task<Result<RevenueReportDto>> GetRevenueReportAsync(ReportPeriod period, CancellationToken cancellationToken)
		{
			var subscriptions = await _unitOfWork.Repository<LawyerSubscription>()
				.AsQueryable()
				.AsNoTracking()
				.Include(x => x.Subscription)
				.ToListAsync(cancellationToken);

			var totalRevenue = subscriptions.Sum(s => s.Subscription.Price);

			var dataPoints = period switch
			{
				ReportPeriod.Weekly => subscriptions
					.GroupBy(s => new
					{
						s.Created.Year,
						Week = ISOWeek.GetWeekOfYear(s.Created)
					})
					.OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Week)
					.Select(g => new RevenueDataPointDto
					{
						Label = $"{g.Key.Year}-W{g.Key.Week:D2}",
						Amount = g.Sum(s => s.Subscription.Price)
					})
					.ToList(),

				ReportPeriod.Yearly => subscriptions
					.GroupBy(s => s.Created.Year)
					.OrderBy(g => g.Key)
					.Select(g => new RevenueDataPointDto
					{
						Label = g.Key.ToString(),
						Amount = g.Sum(s => s.Subscription.Price)
					})
					.ToList(),

				_ => subscriptions
					.GroupBy(s => new { s.Created.Year, s.Created.Month })
					.OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
					.Select(g => new RevenueDataPointDto
					{
						Label = $"{g.Key.Year}-{g.Key.Month:D2}",
						Amount = g.Sum(s => s.Subscription.Price)
					})
					.ToList()
			};

			var dto = new RevenueReportDto
			{
				TotalRevenue = totalRevenue,
				DataPoints = dataPoints
			};

			_logger.LogInformation("Revenue report generated: TotalRevenue={Revenue}, Period={Period}", totalRevenue, period);

			return ApiExceptionResponse.Success(dto, "Revenue report generated successfully");
		}
	}
}
