using Lawyer.Core.Dtos.Analytics;
using Lawyer.Core.Enum;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lawyer.Infrastructure.Repositories
{
    public class AnalyticsRepository : IAnalyticsRepository
    {
        private readonly AppDbContext _context;

        public AnalyticsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<FinancialMetricsDto> GetFinancialMetricsAsync()
        {
            var now = DateTime.UtcNow;
            var paymentsQuery = _context.Payments.AsNoTracking();
            var activeSubscriptionsQuery = _context.Set<LawyerSubscription>()
                .AsNoTracking()
                .Include(s => s.Subscription)
                .Where(s => s.IsActive && s.EndDate >= now);

            var totalRevenue = await paymentsQuery
                .Where(p => p.Status == PaymentStatus.Success)
                .SumAsync(p => p.Amount);

            var totalRefunds = await paymentsQuery
                .Where(p => p.Status == PaymentStatus.Refunded)
                .SumAsync(p => p.Amount);

            var mrr = await activeSubscriptionsQuery
                .SumAsync(s => s.Subscription.DurationDays >= 365 && s.Subscription.YearlyPrice.HasValue
                    ? s.Subscription.YearlyPrice.Value / 12
                    : s.Subscription.Price);

            // Unique paying users
            var uniquePayingUsers = await paymentsQuery
                .Where(p => p.Status == PaymentStatus.Success)
                .Select(p => p.LawyerId)
                .Distinct()
                .CountAsync();

            var arpu = uniquePayingUsers > 0 ? totalRevenue / uniquePayingUsers : 0;

            return new FinancialMetricsDto
            {
                TotalRevenue = totalRevenue,
                MonthlyRecurringRevenue = mrr,
                TotalRefunds = totalRefunds,
                AverageRevenuePerUser = arpu
            };
        }

        public async Task<SubscriptionLifecycleDto> GetSubscriptionMetricsAsync()
        {
            var now = DateTime.UtcNow;
            var subscriptions = await _context.Set<LawyerSubscription>()
                .AsNoTracking()
                .Include(s => s.Subscription)
                .Select(s => new
                {
                    s.LawyerId,
                    s.SubscriptionId,
                    s.StartDate,
                    s.EndDate,
                    s.IsActive,
                    MonthlyEquivalentPrice = s.Subscription.DurationDays >= 365 && s.Subscription.YearlyPrice.HasValue
                        ? s.Subscription.YearlyPrice.Value / 12
                        : s.Subscription.Price,
                    TotalPrice = s.Subscription.DurationDays >= 365 && s.Subscription.YearlyPrice.HasValue
                        ? s.Subscription.YearlyPrice.Value
                        : s.Subscription.Price
                })
                .ToListAsync();
            var thirtyDaysAgo = now.AddDays(-30);

            var newSubscribers = subscriptions
                .GroupBy(s => s.LawyerId)
                .Count(g => g.Min(s => s.StartDate) >= thirtyDaysAgo);

            var renewals = subscriptions
                .GroupBy(s => s.LawyerId)
                .Count(g => g.Count() > 1);

            var oneMonthChurners = subscriptions
                .GroupBy(s => s.LawyerId)
                .Count(g =>
                {
                    var latest = g.OrderByDescending(s => s.EndDate).First();
                    return latest.EndDate < now && latest.EndDate >= thirtyDaysAgo;
                });

            var refundsCount = await _context.Payments
                .Where(p => p.Status == PaymentStatus.Refunded)
                .CountAsync();

            var upgrades = subscriptions
                .GroupBy(s => s.LawyerId)
                .Count(g =>
                {
                    var ordered = g.OrderBy(s => s.StartDate).ToList();
                    for (var i = 1; i < ordered.Count; i++)
                    {
                        if (ordered[i].MonthlyEquivalentPrice > ordered[i - 1].MonthlyEquivalentPrice) return true;
                    }
                    return false;
                });

            return new SubscriptionLifecycleDto
            {
                TotalNewSubscribers = newSubscribers,
                Renewals = renewals,
                OneMonthChurners = oneMonthChurners,
                Upgrades = upgrades,
                Refunds = refundsCount
            };
        }

        public async Task<UserEngagementDto> GetEngagementMetricsAsync()
        {
            var today = DateTime.UtcNow.Date;
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var activityByUser = await LoadActivityByUserAsync();

            var dau = activityByUser.Count(kvp => kvp.Value.Any(d => d >= today));
            var mau = activityByUser.Count(kvp => kvp.Value.Any(d => d >= thirtyDaysAgo));

            var totalUsers = await _context.Set<Core.Models.Lawyer>().CountAsync();
            var dormantUsers = totalUsers - mau;
            if (dormantUsers < 0) dormantUsers = 0;

            var powerUsers = activityByUser.Count(kvp => kvp.Value.Count(d => d >= thirtyDaysAgo) >= 20);

            return new UserEngagementDto
            {
                DailyActiveUsers = dau,
                MonthlyActiveUsers = mau,
                DormantUsers = dormantUsers,
                PowerUsersCount = powerUsers
            };
        }

        public async Task<List<CohortDataDto>> GetCohortAnalysisAsync()
        {
            var users = await _context.Set<Core.Models.Lawyer>()
                .Select(l => new { Id = l.ApplicationUserId, l.Created })
                .ToListAsync();
            var activityByUser = await LoadActivityByUserAsync();

            var cohorts = users
                .GroupBy(u => new DateTime(u.Created.Year, u.Created.Month, 1, 0, 0, 0, DateTimeKind.Utc))
                .Where(g => g.Key <= DateTime.UtcNow)
                .OrderByDescending(g => g.Key)
                .Take(6)
                .Select(g =>
                {
                    var cohortMonth = g.Key;
                    var cohortUserIds = g.Select(u => u.Id).ToHashSet();
                    var totalUsers = cohortUserIds.Count;

                    var retention = new Dictionary<string, double>();
                    for (var month = 1; month <= 3; month++)
                    {
                        var periodStart = cohortMonth.AddMonths(month);
                        var periodEnd = periodStart.AddMonths(1);

                        if (periodStart > DateTime.UtcNow) continue;

                        var retained = cohortUserIds.Count(userId =>
                        {
                            if (!activityByUser.TryGetValue(userId, out var dates)) return false;
                            return dates.Any(d => d >= periodStart && d < periodEnd);
                        });

                        retention[$"الشهر {month}"] = totalUsers > 0 ? Math.Round((double)retained / totalUsers * 100, 1) : 0;
                    }

                    return new CohortDataDto
                    {
                        CohortMonth = cohortMonth.ToString("MMM yyyy"),
                        TotalUsers = totalUsers,
                        RetentionRates = retention
                    };
                })
                .ToList();

            return cohorts;
        }

        private async Task<Dictionary<Guid, List<DateTime>>> LoadActivityByUserAsync()
        {
            var lawyerIds = await _context.Set<Core.Models.Lawyer>()
                .AsNoTracking()
                .Select(l => new { l.Id, l.ApplicationUserId })
                .ToListAsync();

            var lawyerToUser = lawyerIds
                .SelectMany(l => new[]
                {
                    new { ActivityId = l.Id, UserId = l.ApplicationUserId },
                    new { ActivityId = l.ApplicationUserId, UserId = l.ApplicationUserId }
                })
                .GroupBy(x => x.ActivityId)
                .ToDictionary(g => g.Key, g => g.First().UserId);

            var activities = new List<(Guid ActivityId, DateTime OccurredAt)>();

            activities.AddRange(await _context.AiUsageRecords
                .AsNoTracking()
                .Select(a => new ValueTuple<Guid, DateTime>(a.LawyerId, a.CreatedAt))
                .ToListAsync());

            activities.AddRange(await _context.Cases
                .AsNoTracking()
                .Select(c => new ValueTuple<Guid, DateTime>(c.LawyerId, c.Created))
                .ToListAsync());

            activities.AddRange(await _context.Payments
                .AsNoTracking()
                .Where(p => p.Status == PaymentStatus.Success)
                .Select(p => new ValueTuple<Guid, DateTime>(p.LawyerId, p.Created))
                .ToListAsync());

            activities.AddRange(await _context.Set<LawyerSubscription>()
                .AsNoTracking()
                .Select(s => new ValueTuple<Guid, DateTime>(s.LawyerId, s.StartDate))
                .ToListAsync());

            return activities
                .Select(a => new
                {
                    Activity = a,
                    IsKnownLawyer = lawyerToUser.TryGetValue(a.ActivityId, out var userId),
                    UserId = userId,
                    a.OccurredAt
                })
                .Where(a => a.IsKnownLawyer)
                .GroupBy(a => a.UserId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(a => a.OccurredAt).ToList());
        }
    }
}
