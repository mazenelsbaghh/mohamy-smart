	using Lawyer.Application.Dtos.AdminReport;
	using Lawyer.Core.Enums;
	using Lawyer.Core.Exceptions;

	namespace Lawyer.Application.IServices
	{
		public interface IAdminReportService
		{
			Task<Result<LawyersReportDto>> GetLawyersReportAsync(CancellationToken cancellationToken);
			Task<Result<SubscriptionsReportDto>> GetSubscriptionsReportAsync(int pageNumber, int pageSize, CancellationToken cancellationToken);
			Task<Result<RevenueReportDto>> GetRevenueReportAsync(ReportPeriod period, CancellationToken cancellationToken);
			Task<Result<AccountMessagingAuditDto>> GetAccountMessagingAuditAsync(CancellationToken cancellationToken);
		}
	}
