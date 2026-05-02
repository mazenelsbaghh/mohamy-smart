using Lawyer.Application.Common;
using Lawyer.Application.Dtos.InternalRegulations;
using Lawyer.Application.IServices;
using Lawyer.Core.Common;
using Lawyer.Core.Common.Extension;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class InternalRegulationService : IInternalRegulationService
    {
        private const int MaxContextCharactersPerRegulation = 8000;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICaseOcrService _ocrService;
        private readonly ILogger<InternalRegulationService> _logger;

        public InternalRegulationService(
            IUnitOfWork unitOfWork,
            ICaseOcrService ocrService,
            ILogger<InternalRegulationService> logger)
        {
            _unitOfWork = unitOfWork;
            _ocrService = ocrService;
            _logger = logger;
        }

        public async Task<Result<PagedResponse<InternalRegulationDto>>> GetAllAsync(
            Guid lawyerId,
            string? search,
            bool includeArchived,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken)
        {
            if (pageNumber <= 0) pageNumber = 1;
            pageSize = PaginationDefaults.ClampPageSize(pageSize);

            var query = _unitOfWork.Repository<InternalRegulation>()
                .AsQueryable()
                .AsNoTracking()
                .Where(x => x.LawyerId == lawyerId);

            if (!includeArchived)
                query = query.Where(x => x.IsActive);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.Trim();
                query = query.Where(x =>
                    x.Title.Contains(normalizedSearch) ||
                    (x.RegulationNumber != null && x.RegulationNumber.Contains(normalizedSearch)) ||
                    (x.IssuingAuthority != null && x.IssuingAuthority.Contains(normalizedSearch)) ||
                    (x.Summary != null && x.Summary.Contains(normalizedSearch)) ||
                    x.Content.Contains(normalizedSearch));
            }

            var result = await query
                .OrderByDescending(x => x.CreatedAtUtc)
                .Select(x => MapToDto(x))
                .ToPagedResponseAsync(pageNumber, pageSize, cancellationToken);

            return ApiExceptionResponse.Success(result, "تم جلب اللوائح الداخلية بنجاح");
        }

        public async Task<Result<InternalRegulationDto>> GetByIdAsync(Guid id, Guid lawyerId, CancellationToken cancellationToken)
        {
            var entity = await _unitOfWork.Repository<InternalRegulation>()
                .FirstOrDefaultAsync(x => x.Id == id && x.LawyerId == lawyerId, cancellationToken);

            if (entity == null)
                return ApiExceptionResponse.NotFound<InternalRegulationDto>("اللائحة الداخلية غير موجودة");

            return ApiExceptionResponse.Success(MapToDto(entity));
        }

        public async Task<Result<InternalRegulationDto>> CreateAsync(CreateInternalRegulationDto dto, Guid lawyerId, CancellationToken cancellationToken)
        {
            var entity = new InternalRegulation
            {
                Id = Guid.NewGuid(),
                LawyerId = lawyerId,
                Title = dto.Title.Trim(),
                RegulationNumber = NormalizeOptional(dto.RegulationNumber),
                IssuingAuthority = NormalizeOptional(dto.IssuingAuthority),
                Summary = NormalizeOptional(dto.Summary),
                Content = dto.Content.Trim(),
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            };

            await _unitOfWork.Repository<InternalRegulation>().AddAsync(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Internal regulation {RegulationId} created for lawyer {LawyerId}", entity.Id, lawyerId);
            return ApiExceptionResponse.Success(MapToDto(entity), "تم حفظ اللائحة الداخلية بنجاح");
        }

        public async Task<Result<InternalRegulationDto>> CreateFromOcrAsync(CreateInternalRegulationFromOcrDto dto, Guid lawyerId, CancellationToken cancellationToken)
        {
            if (dto.Files == null || dto.Files.Count == 0)
                return ApiExceptionResponse.BadRequest<InternalRegulationDto>("ارفع ملف PDF أو صورة للائحة الداخلية أولًا");

            var ocrResult = await _ocrService.ExtractTextFromImagesAsync(
                dto.Files,
                lawyerId.ToString(),
                cancellationToken,
                requireGoogleVision: true);

            if (!ocrResult.Succeeded)
            {
                return Result<InternalRegulationDto>.Error(
                    ocrResult.StatusCode,
                    ocrResult.Message,
                    ocrResult.Errors);
            }

            var pages = (ocrResult.Data ?? new List<string>())
                .Select((text, index) => new { PageNumber = index + 1, Text = text.Trim() })
                .Where(page => !string.IsNullOrWhiteSpace(page.Text))
                .ToList();

            if (pages.Count == 0)
                return ApiExceptionResponse.BadRequest<InternalRegulationDto>("لم يتم استخراج نص واضح من ملف اللائحة الداخلية");

            var content = BuildOcrContent(dto.Title.Trim(), pages.Select(page => (page.PageNumber, page.Text)));

            return await CreateAsync(new CreateInternalRegulationDto
            {
                Title = dto.Title,
                RegulationNumber = dto.RegulationNumber,
                IssuingAuthority = dto.IssuingAuthority,
                Summary = NormalizeOptional(dto.Summary) ?? $"تم استخراج نص اللائحة من {pages.Count} صفحة عبر Google Vision.",
                Content = content
            }, lawyerId, cancellationToken);
        }

        public async Task<Result<InternalRegulationDto>> UpdateAsync(Guid id, UpdateInternalRegulationDto dto, Guid lawyerId, CancellationToken cancellationToken)
        {
            var entity = await _unitOfWork.Repository<InternalRegulation>()
                .FirstOrDefaultTrackedAsync(x => x.Id == id && x.LawyerId == lawyerId, cancellationToken);

            if (entity == null)
                return ApiExceptionResponse.NotFound<InternalRegulationDto>("اللائحة الداخلية غير موجودة");

            entity.Title = dto.Title.Trim();
            entity.RegulationNumber = NormalizeOptional(dto.RegulationNumber);
            entity.IssuingAuthority = NormalizeOptional(dto.IssuingAuthority);
            entity.Summary = NormalizeOptional(dto.Summary);
            entity.Content = dto.Content.Trim();
            entity.IsActive = dto.IsActive;
            entity.UpdatedAtUtc = DateTime.UtcNow;

            await _unitOfWork.Repository<InternalRegulation>().Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await RebuildLinkedCaseContextsAsync(entity.Id, cancellationToken);

            _logger.LogInformation("Internal regulation {RegulationId} updated for lawyer {LawyerId}", entity.Id, lawyerId);
            return ApiExceptionResponse.Success(MapToDto(entity), "تم تحديث اللائحة الداخلية بنجاح");
        }

        public async Task<Result<InternalRegulationDto>> SetArchiveStatusAsync(Guid id, bool isArchived, Guid lawyerId, CancellationToken cancellationToken)
        {
            var entity = await _unitOfWork.Repository<InternalRegulation>()
                .FirstOrDefaultTrackedAsync(x => x.Id == id && x.LawyerId == lawyerId, cancellationToken);

            if (entity == null)
                return ApiExceptionResponse.NotFound<InternalRegulationDto>("اللائحة الداخلية غير موجودة");

            entity.IsActive = !isArchived;
            entity.UpdatedAtUtc = DateTime.UtcNow;

            await _unitOfWork.Repository<InternalRegulation>().Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await RebuildLinkedCaseContextsAsync(entity.Id, cancellationToken);

            var message = isArchived ? "تم أرشفة اللائحة الداخلية" : "تم استعادة اللائحة الداخلية";
            return ApiExceptionResponse.Success(MapToDto(entity), message);
        }

        private async Task RebuildLinkedCaseContextsAsync(Guid internalRegulationId, CancellationToken cancellationToken)
        {
            var caseIds = await _unitOfWork.Repository<CaseInternalRegulation>()
                .AsQueryable()
                .AsNoTracking()
                .Where(x => x.InternalRegulationId == internalRegulationId)
                .Select(x => x.CaseId)
                .Distinct()
                .ToListAsync(cancellationToken);

            foreach (var caseId in caseIds)
            {
                var caseEntity = await _unitOfWork.Repository<Case>()
                    .FirstOrDefaultTrackedAsync(x => x.Id == caseId, cancellationToken);

                if (caseEntity == null)
                    continue;

                caseEntity.InternalRegulationsContext = await BuildCaseInternalRegulationsContextAsync(caseId, cancellationToken);
                await _unitOfWork.Repository<Case>().Update(caseEntity);
            }

            if (caseIds.Count > 0)
                await _unitOfWork.SaveChangesAsync(cancellationToken);
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

            if (regulations.Count == 0)
                return null;

            var sb = new StringBuilder();
            sb.AppendLine("اللوائح الداخلية المرتبطة بالقضية:");

            foreach (var regulation in regulations)
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

        private static string? NormalizeOptional(string? value)
        {
            var trimmed = value?.Trim();
            return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
        }

        private static string BuildOcrContent(string title, IEnumerable<(int PageNumber, string Text)> pages)
        {
            var sb = new StringBuilder();
            foreach (var page in pages)
            {
                if (sb.Length > 0)
                    sb.AppendLine().AppendLine();

                sb.AppendLine($"{title} - صفحة {page.PageNumber}");
                sb.AppendLine(new string('=', Math.Min(title.Length + 12, 80)));
                sb.AppendLine(page.Text.Trim());
            }

            return sb.ToString().Trim();
        }

        private static InternalRegulationDto MapToDto(InternalRegulation entity)
        {
            return new InternalRegulationDto
            {
                Id = entity.Id,
                Title = entity.Title,
                RegulationNumber = entity.RegulationNumber,
                IssuingAuthority = entity.IssuingAuthority,
                Summary = entity.Summary,
                Content = entity.Content,
                IsActive = entity.IsActive,
                CreatedAtUtc = entity.CreatedAtUtc,
                UpdatedAtUtc = entity.UpdatedAtUtc
            };
        }
    }
}
