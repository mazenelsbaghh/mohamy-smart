using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Lawyer.Application.Dtos.Admin;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public interface IValidationFailureService
    {
        Task<Result<PaginatedResult<ValidationFailureDto>>> GetFailuresAsync(
            int page = 1,
            int pageSize = 20,
            string? workflowType = null,
            int? stepType = null,
            DateTime? from = null,
            DateTime? to = null,
            CancellationToken ct = default);
    }

    public class PaginatedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}
