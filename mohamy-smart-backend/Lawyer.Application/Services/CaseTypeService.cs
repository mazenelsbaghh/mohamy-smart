using Lawyer.Application.Dtos.CaseType;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
	public class CaseTypeService : ICaseTypeService
	{
		private readonly IUnitOfWork _unitOfWork;

		public CaseTypeService(IUnitOfWork unitOfWork)
		{
			_unitOfWork = unitOfWork;
		}

		public async Task<Result<Lawyer.Core.Common.PagedResponse<CaseTypeDto>>> GetAllAsync(string searchQuery, int pageNumber, int pageSize, CancellationToken cancellationToken)
		{
			var query = _unitOfWork.Repository<Core.Models.CaseType>()
				.AsQueryable()
				.AsNoTracking();

			if (!string.IsNullOrWhiteSpace(searchQuery))
				query = query.Where(x => x.Title.Contains(searchQuery));

			var totalRecords = await query.CountAsync(cancellationToken);

			var caseTypes = await query
				.OrderBy(x => x.Id)
				.Skip((pageNumber - 1) * pageSize)
				.Take(pageSize)
				.Select(x => new CaseTypeDto
				{
					Id = x.Id,
					Title = x.Title
				})
				.ToListAsync(cancellationToken);

			var pagedResponse = new Lawyer.Core.Common.PagedResponse<CaseTypeDto>(caseTypes, pageNumber, pageSize, totalRecords);
			return ApiExceptionResponse.Success(pagedResponse, "Case types retrieved successfully");
		}

		public async Task<Result<CaseTypeDto>> GetByIdAsync(int id, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<Core.Models.CaseType>()
				.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

			if (entity == null)
				return ApiExceptionResponse.NotFound<CaseTypeDto>("Case type not found");

			return ApiExceptionResponse.Success(new CaseTypeDto { Id = entity.Id, Title = entity.Title });
		}

		public async Task<Result<CaseTypeDto>> CreateAsync(CreateCaseTypeDto dto, CancellationToken cancellationToken)
		{
			var entity = new Core.Models.CaseType
			{
				Title = dto.Title
			};

			await _unitOfWork.Repository<Core.Models.CaseType>().AddAsync(entity);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			return ApiExceptionResponse.Success(new CaseTypeDto { Id = entity.Id, Title = entity.Title }, "Case type created successfully");
		}

		public async Task<Result<CaseTypeDto>> UpdateAsync(int id, UpdateCaseTypeDto dto, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<Core.Models.CaseType>()
				.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

			if (entity == null)
				return ApiExceptionResponse.NotFound<CaseTypeDto>("Case type not found");

			entity.Title = dto.Title;

			await _unitOfWork.Repository<Core.Models.CaseType>().Update(entity);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			return ApiExceptionResponse.Success(new CaseTypeDto { Id = entity.Id, Title = entity.Title }, "Case type updated successfully");
		}

		public async Task<Result<bool>> DeleteAsync(int id, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<Core.Models.CaseType>()
				.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

			if (entity == null)
				return ApiExceptionResponse.NotFound<bool>("Case type not found");

			_unitOfWork.Repository<Core.Models.CaseType>().Delete(entity);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			return ApiExceptionResponse.Success(true, "Case type deleted successfully");
		}
	}
}
