using Lawyer.Application.Dtos.Case;
using Lawyer.Application.Dtos.InternalRegulations;
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
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;


namespace Lawyer.Application.Services
{
	public class CaseService : ICaseService
	{
		private const int MaxContextCharactersPerRegulation = 8000;
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

                if (dto.InternalRegulationIds?.Count > 0)
                {
                    var linkResult = await ReplaceCaseInternalRegulationsAsync(
                        entity.Id,
                        dto.InternalRegulationIds,
                        lawyerId,
                        lawyerId,
                        cancellationToken);

                    if (!linkResult.Succeeded)
                    {
                        await transaction.RollbackAsync(cancellationToken);
                        return ApiExceptionResponse.BadRequest<CaseDto>(linkResult.Message);
                    }
                }

                _logger.LogInformation("Case created successfully: {CaseNumber}", entity.Number);

                var caseType = await _unitOfWork.Repository<Core.Models.CaseType>()
                    .FirstOrDefaultAsync(x => x.Id == entity.CaseTypeId, cancellationToken);
                var internalRegulations = dto.InternalRegulationIds?.Count > 0
                    ? await GetInternalRegulationSummariesAsync(entity.Id, cancellationToken)
                    : new List<InternalRegulationSummaryDto>();

                await transaction.CommitAsync(cancellationToken);
                return ApiExceptionResponse.Success(MapToDto(entity, caseType?.Title, internalRegulations: internalRegulations), "Case created successfully");
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
			var internalRegulations = await GetInternalRegulationSummariesAsync(entity.Id, cancellationToken);

			return ApiExceptionResponse.Success(MapToDto(entity, caseType?.Title, internalRegulations: internalRegulations));
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
					ClientId = x.ClientId,
					IsActive = x.IsActive
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

			if (dto.InternalRegulationIds != null)
			{
				var linkResult = await ReplaceCaseInternalRegulationsAsync(
					entity.Id,
					dto.InternalRegulationIds,
					entity.LawyerId,
					lawyerId,
					cancellationToken);

				if (!linkResult.Succeeded)
					return ApiExceptionResponse.BadRequest<CaseDto>(linkResult.Message);
			}

			_logger.LogInformation("Case updated: {CaseNumber}", entity.Number);

			var caseType = await _unitOfWork.Repository<Core.Models.CaseType>()
				.FirstOrDefaultAsync(x => x.Id == entity.CaseTypeId, cancellationToken);
			var internalRegulations = await GetInternalRegulationSummariesAsync(entity.Id, cancellationToken);

			return ApiExceptionResponse.Success(MapToDto(entity, caseType?.Title, internalRegulations: internalRegulations), "Case updated successfully");
		}

		public async Task<Result<CaseDto>> UpdateCaseInternalRegulationsAsync(Guid id, UpdateCaseInternalRegulationsDto dto, Guid lawyerId, bool isLawyer, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<Case>().FirstOrDefaultAsync(x => x.Id == id);
			if (entity == null)
				return ApiExceptionResponse.NotFound<CaseDto>("Case not found");

			if (isLawyer && entity.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية تعديل هذه القضية.");

			var linkResult = await ReplaceCaseInternalRegulationsAsync(
				id,
				dto.InternalRegulationIds,
				entity.LawyerId,
				lawyerId,
				cancellationToken);

			if (!linkResult.Succeeded)
				return ApiExceptionResponse.BadRequest<CaseDto>(linkResult.Message);

			var caseType = await _unitOfWork.Repository<Core.Models.CaseType>()
				.FirstOrDefaultAsync(x => x.Id == entity.CaseTypeId, cancellationToken);
			var internalRegulations = await GetInternalRegulationSummariesAsync(entity.Id, cancellationToken);
			entity.InternalRegulationsContext = await BuildCaseInternalRegulationsContextAsync(entity.Id, cancellationToken);

			return ApiExceptionResponse.Success(MapToDto(entity, caseType?.Title, internalRegulations: internalRegulations), "تم تحديث اللوائح الداخلية المرتبطة بالقضية");
		}

		public async Task<Result<CaseDto>> SetArchiveStatusAsync(Guid id, bool isArchived, Guid lawyerId, bool isLawyer, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<Case>().FirstOrDefaultAsync(x => x.Id == id);
			if (entity == null)
				return ApiExceptionResponse.NotFound<CaseDto>("Case not found");

			if (isLawyer && entity.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية تعديل هذه القضية.");

			entity.IsActive = !isArchived;
			await _unitOfWork.Repository<Case>().Update(entity);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation(
				"Case archive status changed: {CaseNumber}, IsArchived={IsArchived}",
				entity.Number,
				isArchived);

			var caseType = await _unitOfWork.Repository<Core.Models.CaseType>()
				.FirstOrDefaultAsync(x => x.Id == entity.CaseTypeId, cancellationToken);

			return ApiExceptionResponse.Success(
				MapToDto(entity, caseType?.Title),
				isArchived ? "Case archived successfully" : "Case restored successfully");
		}

		public async Task<Result<bool>> DeleteCaseAsync(Guid id, Guid lawyerId, bool isLawyer, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<Case>().FirstOrDefaultAsync(x => x.Id == id);
			if (entity == null)
				return ApiExceptionResponse.NotFound<bool>("Case not found");

			if (isLawyer && entity.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية حذف هذه القضية.");

			entity.IsActive = false;
			await _unitOfWork.Repository<Case>().Update(entity);
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

		private async Task<Result<bool>> ReplaceCaseInternalRegulationsAsync(
			Guid caseId,
			IEnumerable<Guid>? requestedIds,
			Guid caseLawyerId,
			Guid userId,
			CancellationToken cancellationToken)
		{
			var caseEntity = await _unitOfWork.Repository<Case>()
				.FirstOrDefaultTrackedAsync(x => x.Id == caseId, cancellationToken);

			if (caseEntity == null)
				return ApiExceptionResponse.NotFound(false, "Case not found");

			var selectedIds = NormalizeRegulationIds(requestedIds);
			var regulations = await LoadOwnedActiveRegulationsAsync(selectedIds, caseLawyerId, cancellationToken);
			if (!regulations.Succeeded)
				return ApiExceptionResponse.BadRequest(false, regulations.Message);

			var currentLinks = await _unitOfWork.Repository<CaseInternalRegulation>()
				.WhereTrackedAsync(x => x.CaseId == caseId, cancellationToken);

			var selectedSet = selectedIds.ToHashSet();
			foreach (var link in currentLinks.Where(x => !selectedSet.Contains(x.InternalRegulationId)))
				_unitOfWork.Repository<CaseInternalRegulation>().Delete(link);

			var currentSet = currentLinks.Select(x => x.InternalRegulationId).ToHashSet();
			foreach (var regulationId in selectedIds.Where(x => !currentSet.Contains(x)))
			{
				await _unitOfWork.Repository<CaseInternalRegulation>().AddAsync(new CaseInternalRegulation
				{
					Id = Guid.NewGuid(),
					CaseId = caseId,
					InternalRegulationId = regulationId,
					CreatedAtUtc = DateTime.UtcNow,
					CreatedByUserId = userId
				});
			}

			caseEntity.InternalRegulationsContext = BuildInternalRegulationsContext(regulations.Data ?? new List<InternalRegulation>());
			await _unitOfWork.Repository<Case>().Update(caseEntity);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			return ApiExceptionResponse.Success(true, "تم تحديث اللوائح الداخلية المرتبطة بالقضية");
		}

		private async Task<Result<List<InternalRegulation>>> LoadOwnedActiveRegulationsAsync(List<Guid> regulationIds, Guid lawyerId, CancellationToken cancellationToken)
		{
			if (regulationIds.Count == 0)
				return ApiExceptionResponse.Success(new List<InternalRegulation>());

			var regulations = await _unitOfWork.Repository<InternalRegulation>()
				.AsQueryable()
				.AsNoTracking()
				.Where(x => regulationIds.Contains(x.Id) && x.LawyerId == lawyerId && x.IsActive)
				.ToListAsync(cancellationToken);

			if (regulations.Count != regulationIds.Count)
				return ApiExceptionResponse.BadRequest<List<InternalRegulation>>("لا يمكن ربط لائحة غير موجودة أو مؤرشفة أو لا تخص هذه القضية");

			return ApiExceptionResponse.Success(regulations);
		}

		private async Task<List<InternalRegulationSummaryDto>> GetInternalRegulationSummariesAsync(Guid caseId, CancellationToken cancellationToken)
		{
			return await _unitOfWork.Repository<CaseInternalRegulation>()
				.AsQueryable()
				.AsNoTracking()
				.Where(x => x.CaseId == caseId)
				.OrderBy(x => x.InternalRegulation.Title)
				.Select(x => new InternalRegulationSummaryDto
				{
					Id = x.InternalRegulation.Id,
					Title = x.InternalRegulation.Title,
					RegulationNumber = x.InternalRegulation.RegulationNumber,
					IssuingAuthority = x.InternalRegulation.IssuingAuthority,
					IsActive = x.InternalRegulation.IsActive
				})
				.ToListAsync(cancellationToken);
		}

		private async Task<string?> BuildCaseInternalRegulationsContextAsync(Guid caseId, CancellationToken cancellationToken)
		{
			var regulations = await _unitOfWork.Repository<CaseInternalRegulation>()
				.AsQueryable()
				.AsNoTracking()
				.Where(x => x.CaseId == caseId && x.InternalRegulation.IsActive)
				.Select(x => x.InternalRegulation)
				.OrderBy(x => x.Title)
				.ToListAsync(cancellationToken);

			return BuildInternalRegulationsContext(regulations);
		}

		private static string? BuildInternalRegulationsContext(IReadOnlyCollection<InternalRegulation> regulations)
		{
			if (regulations.Count == 0)
				return null;

			var sb = new StringBuilder();
			sb.AppendLine("اللوائح الداخلية المرتبطة بالقضية:");

			foreach (var regulation in regulations.OrderBy(x => x.Title))
			{
				sb.AppendLine($"- العنوان: {regulation.Title}");
				if (!string.IsNullOrWhiteSpace(regulation.RegulationNumber))
					sb.AppendLine($"  رقم اللائحة: {regulation.RegulationNumber}");
				if (!string.IsNullOrWhiteSpace(regulation.IssuingAuthority))
					sb.AppendLine($"  جهة الإصدار: {regulation.IssuingAuthority}");
				if (!string.IsNullOrWhiteSpace(regulation.Summary))
					sb.AppendLine($"  الملخص: {regulation.Summary}");

				var content = regulation.Content.Trim();
				if (content.Length > MaxContextCharactersPerRegulation)
					content = content[..MaxContextCharactersPerRegulation] + "\n[تم اختصار نص اللائحة الداخلية لطولها، راجع النص الكامل في المكتبة القانونية.]";

				sb.AppendLine("  النص:");
				sb.AppendLine(content);
			}

			return sb.ToString().Trim();
		}

		private static List<Guid> NormalizeRegulationIds(IEnumerable<Guid>? regulationIds)
		{
			return regulationIds?
				.Where(x => x != Guid.Empty)
				.Distinct()
				.ToList() ?? new List<Guid>();
		}

        private static CaseDto MapToDto(
			Case entity,
			string? caseTypeName = null,
			List<Core.Models.CaseType>? allTypes = null,
			List<InternalRegulationSummaryDto>? internalRegulations = null)
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
				PowerOfAttorneyId = entity.PowerOfAttorneyId,
				InternalRegulations = internalRegulations ?? new List<InternalRegulationSummaryDto>(),
				IsActive = entity.IsActive,
				CreationDate = entity.Created
			};
		}
	}
}
