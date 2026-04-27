using Lawyer.Application.Dtos.CaseType;
using Lawyer.Core.Exceptions;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
	public interface ICaseTypeService
	{
		Task<Result<Lawyer.Core.Common.PagedResponse<CaseTypeDto>>> GetAllAsync(string searchQuery, int pageNumber, int pageSize, CancellationToken cancellationToken);
		Task<Result<CaseTypeDto>> GetByIdAsync(int id, CancellationToken cancellationToken);
		Task<Result<CaseTypeDto>> CreateAsync(CreateCaseTypeDto dto, CancellationToken cancellationToken);
		Task<Result<CaseTypeDto>> UpdateAsync(int id, UpdateCaseTypeDto dto, CancellationToken cancellationToken);
		Task<Result<bool>> DeleteAsync(int id, CancellationToken cancellationToken);
	}
}
