using Lawyer.Application.Dtos.Case;
using Lawyer.Application.Dtos.LawyerReport;
using Lawyer.Application.IServices;
using Lawyer.Application.Common;
using Lawyer.Core.Common;
using Lawyer.Core.Common.Extension;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;


namespace Lawyer.Application.Services
{
	public class CaseService : ICaseService
	{
		private readonly IUnitOfWork _unitOfWork;
		private readonly ILogger<CaseService> _logger;

		public CaseService(
			IUnitOfWork unitOfWork,
			ILogger<CaseService> logger)
		{
			_unitOfWork = unitOfWork;
			_logger = logger;
		}

        public async Task<Result<CaseDto>> CreateCaseAsync(CreateCaseDto dto, Guid lawyerId, CancellationToken cancellationToken)
        {
            if (dto.CaseTypeIds == null || dto.CaseTypeIds.Count == 0)
                return ApiExceptionResponse.BadRequest<CaseDto>("يجب تحديد نوع القضية");

            var primaryTypeId = dto.CaseTypeIds[0];

            await using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var entity = new Case
                {
                    Title = dto.Title,
                    Number = dto.Number,
                    CaseTypeId = primaryTypeId,
                    CaseTypeIds = JsonSerializer.Serialize(dto.CaseTypeIds),
                    Court = dto.Court,
                    ClientName = dto.ClientName,
                    ApponentName = dto.ApponentName ?? string.Empty,
                    DefendingParty = dto.DefendingParty ?? "client",
                    Description = dto.Description,
                    Facts = dto.Facts,
                    LegalClaims = dto.LegalClaims,
                    Status = CaseStatus.Open,
                    LawyerId = lawyerId,
                    PowerOfAttorneyId = dto.PowerOfAttorneyId
                };

                if (dto.PowerOfAttorneyId.HasValue)
                {
                    var poa = await _unitOfWork.Repository<PowerOfAttorney>()
                        .FirstOrDefaultAsync(p => p.Id == dto.PowerOfAttorneyId.Value, cancellationToken);

                    if (poa == null)
                        return ApiExceptionResponse.NotFound<CaseDto>("Power of Attorney not found");

                    if (poa.IsCanceled)
                        return ApiExceptionResponse.BadRequest<CaseDto>("Cannot link to a canceled Power of Attorney");
                }

                if (dto.IsExistedClient)
                {
                    if (!dto.ClientId.HasValue)
                        return ApiExceptionResponse.BadRequest<CaseDto>("ClientId is required when IsExistedClient is true");

                    var existingClient = await _unitOfWork.Repository<Client>()
                        .FirstOrDefaultAsync(x => x.Id == dto.ClientId.Value, cancellationToken);

                    if (existingClient == null)
                        return ApiExceptionResponse.NotFound<CaseDto>("Client not found");

                    if (existingClient.LawyerId != lawyerId)
                        return ApiExceptionResponse.BadRequest<CaseDto>("Client does not belong to this lawyer");

                    entity.ClientName = existingClient.ClientName;
                    entity.ClientId = existingClient.Id;

                    await _unitOfWork.Repository<Case>().AddAsync(entity);
                    await _unitOfWork.Repository<Client>().Update(existingClient);
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                }
                else
                {
                    var newClient = new Client
                    {
                        ClientName = dto.ClientName,
                        LawyerId = lawyerId
                    };

                    // Add client first so EF assigns/tracks its Id before we reference it on Case
                    await _unitOfWork.Repository<Client>().AddAsync(newClient);

                    // Now newClient.Id is populated by EF change tracking
                    entity.ClientId = newClient.Id;

                    await _unitOfWork.Repository<Case>().AddAsync(entity);
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                }

                _logger.LogInformation("Case created successfully: {CaseNumber}", entity.Number);

                var caseType = await _unitOfWork.Repository<Core.Models.CaseType>()
                    .FirstOrDefaultAsync(x => x.Id == entity.CaseTypeId, cancellationToken);

                await transaction.CommitAsync(cancellationToken);
                return ApiExceptionResponse.Success(MapToDto(entity, caseType?.Title), "Case created successfully");
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        public async Task<Result<CaseDto>> GetByIdAsync(Guid id, Guid lawyerId, bool isLawyer, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<Case>().FirstOrDefaultAsync(x => x.Id == id);
			if (entity == null)
				return ApiExceptionResponse.NotFound<CaseDto>("Case not found");

			if (isLawyer && entity.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية الوصول إلى هذه القضية.");

			var caseType = await _unitOfWork.Repository<Core.Models.CaseType>()
				.FirstOrDefaultAsync(x => x.Id == entity.CaseTypeId, cancellationToken);

			return ApiExceptionResponse.Success(MapToDto(entity, caseType?.Title));
		}

		public async Task<Result<PagedResponse<CaseDto>>> GetAllAsync(
			int pageNumber,
			int pageSize,
			Guid? lawyerId,
			bool? isActive,
			CancellationToken cancellationToken)
		{
			if (pageNumber <= 0) pageNumber = 1;
			pageSize = PaginationDefaults.ClampPageSize(pageSize);

			var query = _unitOfWork.Repository<Case>()
				.AsQueryable()
				.AsNoTracking()
				.OrderByDescending(x => x.Created);

			if (lawyerId.HasValue)
				query = (IOrderedQueryable<Case>)query.Where(x => x.LawyerId == lawyerId.Value);

			if (isActive.HasValue)
				query = (IOrderedQueryable<Case>)query.Where(x => x.IsActive == isActive.Value);

			var pagedResult = await query
				.Select(x => new CaseDto
				{
					Id = x.Id,
					Title = x.Title,
					Number = x.Number,
					CaseTypeId = x.CaseTypeId,
					CaseTypeName = x.CaseType.Title,
					Court = x.Court,
					ClientName = x.ClientName,
					ApponentName = x.ApponentName,
					DefendingParty = x.DefendingParty ?? "client",
				    CreationDate = x.Created,
					Status = x.Status,
					ClientId = x.ClientId
				})
				.ToPagedResponseAsync(pageNumber, pageSize, cancellationToken);

			_logger.LogInformation(
				"Retrieved {Count} cases for lawyer {LawyerId} on page {PageNumber}",
				pagedResult.Data.Count,
				lawyerId,
				pageNumber
			);

			return ApiExceptionResponse.Success(pagedResult, "Cases retrieved successfully");
		}

		public async Task<Result<CaseDto>> UpdateCaseAsync(Guid id, UpdateCaseDto dto, Guid lawyerId, bool isLawyer, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<Case>().FirstOrDefaultAsync(x => x.Id == id);
			if (entity == null)
				return ApiExceptionResponse.NotFound<CaseDto>("Case not found");

			if (isLawyer && entity.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية تعديل هذه القضية.");

			entity.Title = dto.Title;
			entity.Number = dto.Number;
			if (dto.CaseTypeIds != null && dto.CaseTypeIds.Count > 0)
			{
				entity.CaseTypeId = dto.CaseTypeIds[0];
				entity.CaseTypeIds = JsonSerializer.Serialize(dto.CaseTypeIds);
			}
			entity.Court = dto.Court;
			entity.ClientName = dto.ClientName;
			entity.ApponentName = dto.ApponentName ?? string.Empty;
			entity.Description = dto.Description;
			entity.Facts = dto.Facts;
			entity.LegalClaims = dto.LegalClaims;
			entity.Status = dto.Status;

			await _unitOfWork.Repository<Case>().Update(entity);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("Case updated: {CaseNumber}", entity.Number);

			var caseType = await _unitOfWork.Repository<Core.Models.CaseType>()
				.FirstOrDefaultAsync(x => x.Id == entity.CaseTypeId, cancellationToken);

			return ApiExceptionResponse.Success(MapToDto(entity, caseType?.Title), "Case updated successfully");
		}

		public async Task<Result<bool>> DeleteCaseAsync(Guid id, Guid lawyerId, bool isLawyer, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<Case>().FirstOrDefaultAsync(x => x.Id == id);
			if (entity == null)
				return ApiExceptionResponse.NotFound<bool>("Case not found");

			if (isLawyer && entity.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية حذف هذه القضية.");

			entity.IsActive = false;
			await _unitOfWork.SaveChangesAsync(cancellationToken);
			_logger.LogInformation("Case deleted: {CaseNumber}", entity.Number);
			return ApiExceptionResponse.Success(true, "Case deleted successfully");
		}

		public async Task<Result<LawyerDashboardReportDto>> GetLawyerDashboardReportAsync(Guid lawyerId, CancellationToken cancellationToken)
		{
			var totalCases = await _unitOfWork.Repository<Case>()
				.AsQueryable()
				.AsNoTracking()
				.CountAsync(x => x.LawyerId == lawyerId, cancellationToken);

			var totalActiveCases = await _unitOfWork.Repository<Case>()
				.AsQueryable()
				.AsNoTracking()
				.CountAsync(x => x.LawyerId == lawyerId && x.IsActive && x.Status == CaseStatus.Open, cancellationToken);

			var totalClients = await _unitOfWork.Repository<Client>()
				.AsQueryable()
				.AsNoTracking()
				.CountAsync(x => x.LawyerId == lawyerId && x.IsActive, cancellationToken);

			var dto = new LawyerDashboardReportDto
			{
				TotalCases = totalCases,
				TotalActiveCases = totalActiveCases,
				TotalClients = totalClients
			};

			_logger.LogInformation(
				"Lawyer dashboard report generated for {LawyerId}: Cases={Total}, Active={Active}, Clients={Clients}",
				lawyerId, totalCases, totalActiveCases, totalClients);

			return ApiExceptionResponse.Success(dto, "Lawyer dashboard report generated successfully");
		}

        private static CaseDto MapToDto(Case entity, string? caseTypeName = null, List<Core.Models.CaseType>? allTypes = null)
		{
			var ids = string.IsNullOrEmpty(entity.CaseTypeIds)
				? new List<int> { entity.CaseTypeId }
				: JsonSerializer.Deserialize<List<int>>(entity.CaseTypeIds) ?? new List<int> { entity.CaseTypeId };

			var names = allTypes != null
				? ids.Select(id => allTypes.FirstOrDefault(t => t.Id == id)?.Title ?? string.Empty).ToList()
				: new List<string> { caseTypeName ?? entity.CaseType?.Title ?? string.Empty };

			return new CaseDto
			{
				Id = entity.Id,
				Title = entity.Title,
				Number = entity.Number,
				CaseTypeId = entity.CaseTypeId,
				CaseTypeName = caseTypeName ?? entity.CaseType?.Title ?? string.Empty,
				CaseTypeIds = ids,
				CaseTypeNames = names,
				Court = entity.Court,
				ClientName = entity.ClientName,
				ApponentName = entity.ApponentName,
				DefendingParty = entity.DefendingParty ?? "client",
				Description = entity.Description,
				Facts = entity.Facts,
				LegalClaims = entity.LegalClaims,
				Status = entity.Status,
				ClientId = entity.ClientId,
				CreationDate = entity.Created
			};
		}
	}
}
