using Lawyer.Application.Dtos.Case;
using Lawyer.Application.Dtos.LawyerReport;
using Lawyer.Core.Common;
using Lawyer.Core.Exceptions;
using System;
using System.Threading.Tasks;


namespace Lawyer.Application.IServices
{
	public interface ICaseService
	{
		Task<Result<CaseDto>> CreateCaseAsync(CreateCaseDto dto, Guid lawyerId, CancellationToken cancellationToken);
		Task<Result<CaseDto>> GetByIdAsync(Guid id, Guid lawyerId, bool isLawyer, CancellationToken cancellationToken);
		Task<Result<PagedResponse<CaseDto>>> GetAllAsync(
			int pageNumber,
			int pageSize,
			Guid? lawyerId,
			bool? isActive,
			CancellationToken cancellationToken);
		Task<Result<CaseDto>> UpdateCaseAsync(Guid id, UpdateCaseDto dto, Guid lawyerId, bool isLawyer, CancellationToken cancellationToken);
		Task<Result<bool>> DeleteCaseAsync(Guid id, Guid lawyerId, bool isLawyer, CancellationToken cancellationToken);
		Task<Result<LawyerDashboardReportDto>> GetLawyerDashboardReportAsync(Guid lawyerId, CancellationToken cancellationToken);
    }
}
