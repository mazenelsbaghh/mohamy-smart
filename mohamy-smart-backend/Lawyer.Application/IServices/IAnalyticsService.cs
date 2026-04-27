using Lawyer.Core.Dtos.Analytics;
using Lawyer.Core.Exceptions;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface IAnalyticsService
    {
        Task<Result<FinancialMetricsDto>> GetFinancialMetricsAsync();
        Task<Result<SubscriptionLifecycleDto>> GetSubscriptionMetricsAsync();
        Task<Result<UserEngagementDto>> GetEngagementMetricsAsync();
        Task<Result<List<CohortDataDto>>> GetCohortAnalysisAsync();
    }
}
