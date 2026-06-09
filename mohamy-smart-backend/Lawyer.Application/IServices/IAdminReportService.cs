	using Lawyer.Application.Dtos.AdminReport;
	using Lawyer.Application.Models;
	using Lawyer.Core.Enum;
	using Lawyer.Core.Exceptions;

	namespace Lawyer.Application.IServices
	{
		public interface IAdminReportService
		{
			Task<Result<LawyersReportDto>> GetLawyersReportAsync(CancellationToken cancellationToken);
			Task<Result<SubscriptionsReportDto>> GetSubscriptionsReportAsync(int pageNumber, int pageSize, CancellationToken cancellationToken);
			Task<Result<RevenueReportDto>> GetRevenueReportAsync(ReportPeriod period, CancellationToken cancellationToken);
			Task<Result<AccountMessagingAuditDto>> GetAccountMessagingAuditAsync(CancellationToken cancellationToken);
			Task<Result<PaginatedList<LawyerCasesStatsDto>>> GetLawyersCasesStatsAsync(int pageNumber, int pageSize, string? search, CancellationToken cancellationToken);
		}
	}
