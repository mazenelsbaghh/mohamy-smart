using Lawyer.Application.Dtos.LawyerTask;
using Lawyer.Core.Common;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
	public interface ILawyerTaskService
	{
		Task<Result<LawyerTaskDto>> CreateAsync(CreateLawyerTaskDto dto, Guid lawyerId, CancellationToken cancellationToken);
		Task<Result<LawyerTaskDto>> GetByIdAsync(Guid id, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken);
		Task<Result<PagedResponse<LawyerTaskDto>>> GetAllAsync(int pageNumber, int pageSize, Guid? lawyerId, CancellationToken cancellationToken);
		Task<Result<LawyerTaskDto>> UpdateAsync(Guid id, UpdateLawyerTaskDto dto, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken);
		Task<Result<bool>> DeleteAsync(Guid id, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken);
		Task<Result<List<LawyerTaskDto>>> GetByPeriodAsync(TaskPeriod period, DateTime date, Guid? lawyerId, CancellationToken cancellationToken);
	}
}
