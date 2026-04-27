using Lawyer.Application.Dtos.Contracts;
using Lawyer.Core.Common;
using Lawyer.Core.Exceptions;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface ILegalContractService
    {
        // US1: Create a new AI-drafted legal contract for an existing client
        Task<Result<LegalContractDetailsDto>> CreateLegalContractAsync(
            Guid lawyerId,
            Guid createdByUserId,
            CreateLegalContractRequestDto request,
            CancellationToken cancellationToken);

        // US1: Get the fixed contract type catalog
        Task<Result<IReadOnlyList<ContractTypeOptionDto>>> GetAvailableContractTypesAsync(
            CancellationToken cancellationToken);

        // US3: Paginated list of contracts owned by the lawyer
        Task<Result<PagedResponse<LegalContractDto>>> GetLegalContractsAsync(
            Guid lawyerId,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken);

        // US3: Single contract details with ownership check
        Task<Result<LegalContractDetailsDto>> GetLegalContractDetailsAsync(
            Guid lawyerId,
            Guid contractId,
            CancellationToken cancellationToken);
    }
}
