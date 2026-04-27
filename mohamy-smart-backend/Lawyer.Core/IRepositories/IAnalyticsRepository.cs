using Lawyer.Core.Dtos.Analytics;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lawyer.Core.IRepositories
{
    public interface IAnalyticsRepository
    {
        Task<FinancialMetricsDto> GetFinancialMetricsAsync();
        Task<SubscriptionLifecycleDto> GetSubscriptionMetricsAsync();
        Task<UserEngagementDto> GetEngagementMetricsAsync();
        Task<List<CohortDataDto>> GetCohortAnalysisAsync();
    }
}
