using System;
using System.Threading;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lawyer.Core.Exceptions;
using Lawyer.Application.Dtos.ProcessServerPaper;
using Lawyer.Application.IServices;
using Lawyer.Core.Enum;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Mapster;

namespace Lawyer.Application.Services
{
    public class ProcessServerPaperService : IProcessServerPaperService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly Lawyer.Application.Common.Interface.IFileUploadService _fileUploadService;

        public ProcessServerPaperService(IUnitOfWork unitOfWork, Lawyer.Application.Common.Interface.IFileUploadService fileUploadService)
        {
            _unitOfWork = unitOfWork;
            _fileUploadService = fileUploadService;
        }

        public async Task<Result<List<ProcessServerPaperDto>>> GetAllAsync(Guid lawyerId, Guid? clientId = null, Guid? caseId = null, ProcessServerPaperStatus? status = null, ProcessServerPaperType? type = null, CancellationToken cancellationToken = default)
        {
            var query = _unitOfWork.Repository<ProcessServerPaper>().AsQueryable()
                .Include(p => p.Client)
                .Include(p => p.Case)
                .Where(p => p.LawyerId == lawyerId);

            if (clientId.HasValue)
                query = query.Where(p => p.ClientId == clientId.Value);
            
            if (caseId.HasValue)
                query = query.Where(p => p.CaseId == caseId.Value);
                
            if (status.HasValue)
                query = query.Where(p => p.Status == status.Value);
                
            if (type.HasValue)
                query = query.Where(p => p.PaperType == type.Value);

            var papers = await query.OrderByDescending(p => p.Created).ToListAsync();
            
            var dtos = papers.Select(p => 
            {
                var dto = p.Adapt<ProcessServerPaperDto>();
                if (p.Client != null) dto.Client = p.Client.Adapt<Lawyer.Application.Dtos.Client.ClientDto>();
                if (p.Case != null) dto.Case = new { id = p.Case.Id, title = p.Case.Title, number = p.Case.Number };
                return dto;
            }).ToList();

            return ApiExceptionResponse.Success(dtos);
        }

        public async Task<Result<ProcessServerPaperDto>> GetByIdAsync(Guid id, Guid lawyerId, CancellationToken cancellationToken = default)
        {
            var paper = await _unitOfWork.Repository<ProcessServerPaper>().AsQueryable()
                .Include(p => p.Client)
                .Include(p => p.Case)
                .FirstOrDefaultAsync(p => p.Id == id && p.LawyerId == lawyerId);

            if (paper == null)
                return ApiExceptionResponse.NotFound<ProcessServerPaperDto>("الورقة غير موجودة.");

            var dto = paper.Adapt<ProcessServerPaperDto>();
            if (paper.Client != null) dto.Client = paper.Client.Adapt<Lawyer.Application.Dtos.Client.ClientDto>();
            if (paper.Case != null) dto.Case = new { id = paper.Case.Id, title = paper.Case.Title, number = paper.Case.Number };

            return ApiExceptionResponse.Success(dto);
        }

        public async Task<Result<ProcessServerPaperDto>> CreateAsync(CreateProcessServerPaperDto dto, Guid lawyerId, CancellationToken cancellationToken = default)
        {
            var clientExists = await _unitOfWork.Repository<Client>().AnyAsync(c => c.Id == dto.ClientId && c.LawyerId == lawyerId);
            if (!clientExists) return ApiExceptionResponse.NotFound<ProcessServerPaperDto>("الموكل غير موجود.");

            if (dto.CaseId.HasValue)
            {
                var caseExists = await _unitOfWork.Repository<Case>().AnyAsync(c => c.Id == dto.CaseId.Value && c.LawyerId == lawyerId);
                if (!caseExists) return ApiExceptionResponse.NotFound<ProcessServerPaperDto>("القضية غير موجودة.");
            }

            var paper = dto.Adapt<ProcessServerPaper>();
            paper.LawyerId = lawyerId;
            paper.Created = DateTime.UtcNow;
            paper.CreatedBy = lawyerId;
            paper.UpdatedBy = lawyerId;

            await _unitOfWork.Repository<ProcessServerPaper>().AddAsync(paper);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return await GetByIdAsync(paper.Id, lawyerId, cancellationToken);
        }

        public async Task<Result<ProcessServerPaperDto>> UpdateAsync(Guid id, UpdateProcessServerPaperDto dto, Guid lawyerId, CancellationToken cancellationToken = default)
        {
            var paper = await _unitOfWork.Repository<ProcessServerPaper>().FirstOrDefaultAsync(p => p.Id == id && p.LawyerId == lawyerId);
            if (paper == null) return ApiExceptionResponse.NotFound<ProcessServerPaperDto>("الورقة غير موجودة.");

            if (dto.PaperType.HasValue) paper.PaperType = dto.PaperType.Value;
            if (dto.OtherPaperType != null) paper.OtherPaperType = dto.OtherPaperType;
            if (dto.CustomPaperTypeTitle != null) paper.CustomPaperTypeTitle = dto.CustomPaperTypeTitle;
            if (dto.TargetName != null) paper.TargetName = dto.TargetName;
            if (dto.Status.HasValue) paper.Status = dto.Status.Value;
            if (dto.Notes != null) paper.Notes = dto.Notes;

            paper.Updated = DateTime.UtcNow;
            paper.UpdatedBy = lawyerId;

            await _unitOfWork.Repository<ProcessServerPaper>().Update(paper);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return await GetByIdAsync(paper.Id, lawyerId, cancellationToken);
        }

        public async Task<Result<bool>> DeleteAsync(Guid id, Guid lawyerId, CancellationToken cancellationToken = default)
        {
            var paper = await _unitOfWork.Repository<ProcessServerPaper>().FirstOrDefaultAsync(p => p.Id == id && p.LawyerId == lawyerId);
            if (paper == null) return ApiExceptionResponse.NotFound<bool>("الورقة غير موجودة.");

            _unitOfWork.Repository<ProcessServerPaper>().Delete(paper);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiExceptionResponse.Success(true);
        }

        public async Task<Result<ProcessServerPaperDto>> UploadAttachmentAsync(Guid id, IFormFile file, Guid lawyerId, CancellationToken cancellationToken = default)
        {
            var paper = await _unitOfWork.Repository<ProcessServerPaper>().FirstOrDefaultAsync(p => p.Id == id && p.LawyerId == lawyerId);
            if (paper == null) return ApiExceptionResponse.NotFound<ProcessServerPaperDto>("الورقة غير موجودة.");

            var fileUrl = await _fileUploadService.UploadGeneralFileAsync(file, "process-server-papers");
            if (string.IsNullOrEmpty(fileUrl))
                return ApiExceptionResponse.ServerError<ProcessServerPaperDto>("Failed to upload attachment");

            paper.AttachmentUrl = fileUrl;
            paper.Updated = DateTime.UtcNow;
            paper.UpdatedBy = lawyerId;

            await _unitOfWork.Repository<ProcessServerPaper>().Update(paper);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return await GetByIdAsync(paper.Id, lawyerId, cancellationToken);
        }

        public async Task<Result<ProcessServerPaperDto>> MarkServedAsync(Guid id, MarkServedDto dto, Guid lawyerId, CancellationToken cancellationToken = default)
        {
            var paper = await _unitOfWork.Repository<ProcessServerPaper>().FirstOrDefaultAsync(p => p.Id == id && p.LawyerId == lawyerId);
            if (paper == null) return ApiExceptionResponse.NotFound<ProcessServerPaperDto>("الورقة غير موجودة.");

            paper.Status = ProcessServerPaperStatus.Served;
            paper.ServedDate = dto.ServedDate;
            paper.Updated = DateTime.UtcNow;
            paper.UpdatedBy = lawyerId;

            await _unitOfWork.Repository<ProcessServerPaper>().Update(paper);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return await GetByIdAsync(paper.Id, lawyerId, cancellationToken);
        }
    }
}
