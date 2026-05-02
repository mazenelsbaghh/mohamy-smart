using Lawyer.Application.Dtos.InternalRegulations;
using Lawyer.Core.Common;
using Lawyer.Core.Exceptions;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface IInternalRegulationService
    {
        Task<Result<PagedResponse<InternalRegulationDto>>> GetAllAsync(
            Guid lawyerId,
            string? search,
            bool includeArchived,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken);

        Task<Result<InternalRegulationDto>> GetByIdAsync(Guid id, Guid lawyerId, CancellationToken cancellationToken);
        Task<Result<InternalRegulationDto>> CreateAsync(CreateInternalRegulationDto dto, Guid lawyerId, CancellationToken cancellationToken);
        Task<Result<InternalRegulationDto>> UpdateAsync(Guid id, UpdateInternalRegulationDto dto, Guid lawyerId, CancellationToken cancellationToken);
        Task<Result<InternalRegulationDto>> SetArchiveStatusAsync(Guid id, bool isArchived, Guid lawyerId, CancellationToken cancellationToken);
    }
}
