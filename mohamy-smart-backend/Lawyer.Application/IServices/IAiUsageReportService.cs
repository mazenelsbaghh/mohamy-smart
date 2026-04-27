using Lawyer.Application.Dtos.AiUsageReport;
using Lawyer.Core.Common;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public interface IAiUsageReportService
    {
        Task<Result<AiUsageSummaryDto>> GetUsageSummaryAsync(DateTime? from, DateTime? to, CancellationToken ct);
        Task<Result<PagedResponse<LawyerUsageDto>>> GetLawyerUsageAsync(int pageNumber, int pageSize, DateTime? from, DateTime? to, CancellationToken ct);
        Task<Result<LawyerUsageDetailDto>> GetLawyerUsageDetailAsync(Guid lawyerId, DateTime? from, DateTime? to, CancellationToken ct);
        Task<Result<List<ModelUsageDto>>> GetModelUsageAsync(DateTime? from, DateTime? to, CancellationToken ct);
    }
}
