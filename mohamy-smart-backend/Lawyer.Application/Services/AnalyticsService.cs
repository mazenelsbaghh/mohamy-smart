using Lawyer.Core.Dtos.Analytics;
using Lawyer.Application.IServices;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Exceptions;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IAnalyticsRepository _analyticsRepository;

        public AnalyticsService(IAnalyticsRepository analyticsRepository)
        {
            _analyticsRepository = analyticsRepository;
        }

        public async Task<Result<FinancialMetricsDto>> GetFinancialMetricsAsync()
        {
            var data = await _analyticsRepository.GetFinancialMetricsAsync();
            return Result<FinancialMetricsDto>.Success(data);
        }

        public async Task<Result<SubscriptionLifecycleDto>> GetSubscriptionMetricsAsync()
        {
            var data = await _analyticsRepository.GetSubscriptionMetricsAsync();
            return Result<SubscriptionLifecycleDto>.Success(data);
        }

        public async Task<Result<UserEngagementDto>> GetEngagementMetricsAsync()
        {
            var data = await _analyticsRepository.GetEngagementMetricsAsync();
            return Result<UserEngagementDto>.Success(data);
        }

        public async Task<Result<List<CohortDataDto>>> GetCohortAnalysisAsync()
        {
            var data = await _analyticsRepository.GetCohortAnalysisAsync();
            return Result<List<CohortDataDto>>.Success(data);
        }
    }
}
