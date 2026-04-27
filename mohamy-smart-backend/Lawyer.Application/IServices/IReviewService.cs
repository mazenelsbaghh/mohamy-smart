using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Lawyer.Application.Dtos.Reviews;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public interface IReviewService
    {
        Task<Result<Lawyer.Core.Common.PagedResponse<ReviewDto>>> GetAllReviewsAsync(string? status, int pageNumber, int pageSize, CancellationToken ct);
        Task<Result<ReviewDto>> UpdateReviewStatusAsync(Guid id, string status, CancellationToken ct);
    }
}
