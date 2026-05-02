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
            var paymentsQuery = _context.Payments.AsNoTracking();

            var totalRevenue = await paymentsQuery
                .Where(p => p.Status == PaymentStatus.Success)
                .SumAsync(p => p.Amount);

            var totalRefunds = await paymentsQuery
                .Where(p => p.Status == PaymentStatus.Refunded)
                .SumAsync(p => p.Amount);

            // MRR: Sum of revenue from payments made in the last 30 days
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var mrr = await paymentsQuery
                .Where(p => p.Status == PaymentStatus.Success && p.Created >= thirtyDaysAgo)
                .SumAsync(p => p.Amount);

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
            var subscriptionsQuery = _context.Set<LawyerSubscription>().AsNoTracking();
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var newSubscribers = await subscriptionsQuery
                .Where(s => s.StartDate >= thirtyDaysAgo)
                .CountAsync();

            var renewals = await subscriptionsQuery
                .GroupBy(s => s.LawyerId)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .CountAsync();

            var oneMonthChurners = await subscriptionsQuery
                .Where(s => s.EndDate < DateTime.UtcNow)
                .GroupBy(s => s.LawyerId)
                .Where(g => g.Count() == 1)
                .Select(g => g.Key)
                .CountAsync();

            var refundsCount = await _context.Payments
                .Where(p => p.Status == PaymentStatus.Refunded)
                .CountAsync();

            var activeSubscriptionIds = await subscriptionsQuery
                .Where(s => s.EndDate >= DateTime.UtcNow)
                .Select(s => s.SubscriptionId)
                .Distinct()
                .ToListAsync();

            var allSubscriptionIds = await subscriptionsQuery
                .Select(s => s.SubscriptionId)
                .Distinct()
                .ToListAsync();

            var upgrades = allSubscriptionIds.Count > 0 && activeSubscriptionIds.Count > 0
                ? Math.Max(0, allSubscriptionIds.Count - refundsCount - oneMonthChurners)
                : 0;

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

            // Using AiUsageRecords as a proxy for engagement activity
            var dau = await _context.AiUsageRecords
                .Where(a => a.CreatedAt >= today)
                .Select(a => a.LawyerId)
                .Distinct()
                .CountAsync();

            var mau = await _context.AiUsageRecords
                .Where(a => a.CreatedAt >= thirtyDaysAgo)
                .Select(a => a.LawyerId)
                .Distinct()
                .CountAsync();

            var totalUsers = await _context.Users.CountAsync();
            var dormantUsers = totalUsers - mau;
            if (dormantUsers < 0) dormantUsers = 0;

            var powerUsers = await _context.AiUsageRecords
                .Where(a => a.CreatedAt >= thirtyDaysAgo)
                .GroupBy(a => a.LawyerId)
                .Where(g => g.Count() >= 20) // >= 20 AI usages in 30 days
                .Select(g => g.Key)
                .CountAsync();

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
            var users = await _context.Users
                .Select(u => new { u.Id, u.CreatedAt })
                .ToListAsync();

            var activity = await _context.AiUsageRecords
                .Select(a => new { a.LawyerId, a.CreatedAt })
                .ToListAsync();

            var lawyerIdToUserIds = await _context.Set<Core.Models.Lawyer>()
                .Select(l => new { l.Id, l.ApplicationUserId })
                .ToListAsync();

            var activityByUser = activity
                .Join(lawyerIdToUserIds,
                    a => a.LawyerId,
                    l => (Guid?)l.Id,
                    (a, l) => new { UserId = l.ApplicationUserId, a.CreatedAt })
                .Concat(activity
                    .Join(lawyerIdToUserIds,
                    a => a.LawyerId,
                    l => l.ApplicationUserId,
                    (a, l) => new { UserId = l.ApplicationUserId, a.CreatedAt }))
                .GroupBy(x => x.UserId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.CreatedAt).ToList());

            var cohorts = users
                .GroupBy(u => new DateTime(u.CreatedAt.Year, u.CreatedAt.Month, 1, 0, 0, 0, DateTimeKind.Utc))
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
    }
}
