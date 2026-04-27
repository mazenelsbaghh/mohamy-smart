using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lawyer.Application.DTOs.Client;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.Interfaces
{
    public interface IDocumentHandoffService
    {
        Task<Result<IEnumerable<DocumentHandoffDto>>> GetByClientAsync(Guid clientId);
        Task<Result<DocumentHandoffDto>> CreateAsync(CreateDocumentHandoffDto dto, CancellationToken cancellationToken = default);
    }
}
