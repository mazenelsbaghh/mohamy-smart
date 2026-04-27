using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lawyer.Core.Exceptions;
using Lawyer.Application.Dtos.ProcessServerPaper;
using Lawyer.Core.Enum;
using Microsoft.AspNetCore.Http;

using System.Threading;

namespace Lawyer.Application.IServices
{
    public interface IProcessServerPaperService
    {
        Task<Result<List<ProcessServerPaperDto>>> GetAllAsync(Guid lawyerId, Guid? clientId = null, Guid? caseId = null, ProcessServerPaperStatus? status = null, ProcessServerPaperType? type = null, CancellationToken cancellationToken = default);
        Task<Result<ProcessServerPaperDto>> GetByIdAsync(Guid id, Guid lawyerId, CancellationToken cancellationToken = default);
        Task<Result<ProcessServerPaperDto>> CreateAsync(CreateProcessServerPaperDto dto, Guid lawyerId, CancellationToken cancellationToken = default);
        Task<Result<ProcessServerPaperDto>> UpdateAsync(Guid id, UpdateProcessServerPaperDto dto, Guid lawyerId, CancellationToken cancellationToken = default);
        Task<Result<bool>> DeleteAsync(Guid id, Guid lawyerId, CancellationToken cancellationToken = default);
        Task<Result<ProcessServerPaperDto>> UploadAttachmentAsync(Guid id, IFormFile file, Guid lawyerId, CancellationToken cancellationToken = default);
        Task<Result<ProcessServerPaperDto>> MarkServedAsync(Guid id, MarkServedDto dto, Guid lawyerId, CancellationToken cancellationToken = default);
    }
}
