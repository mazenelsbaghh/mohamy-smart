using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Lawyer.Application.Dtos.Admin;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace Lawyer.Application.Services
{
    public class ValidationFailureService : IValidationFailureService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ValidationFailureService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<PaginatedResult<ValidationFailureDto>>> GetFailuresAsync(
            int page = 1,
            int pageSize = 20,
            string? workflowType = null,
            int? stepType = null,
            DateTime? from = null,
            DateTime? to = null,
            CancellationToken ct = default)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var query = _unitOfWork.Repository<ValidationFailureRecord>()
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(workflowType))
                    query = query.Where(r => r.WorkflowType == workflowType);
                if (stepType.HasValue)
                    query = query.Where(r => r.StepType == stepType.Value);
                if (from.HasValue)
                    query = query.Where(r => r.OccurredAt >= from.Value);
                if (to.HasValue)
                    query = query.Where(r => r.OccurredAt <= to.Value);

                var totalCount = await query.CountAsync(ct);
                var items = await query
                    .OrderByDescending(r => r.OccurredAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new ValidationFailureDto
                    {
                        Id = r.Id,
                        WorkflowType = r.WorkflowType,
                        StepType = r.StepType,
                        OccurredAt = r.OccurredAt,
                        ErrorSummary = r.ErrorSummary,
                        CaseId = r.CaseId,
                        LawyerId = r.LawyerId
                    })
                    .ToListAsync(ct);

                return Result<PaginatedResult<ValidationFailureDto>>.Success(
                    new PaginatedResult<ValidationFailureDto>
                    {
                        Items = items,
                        TotalCount = totalCount,
                        Page = page,
                        PageSize = pageSize
                    });
            }
            catch (Exception ex)
            {
                return Result<PaginatedResult<ValidationFailureDto>>.Error(
                    System.Net.HttpStatusCode.InternalServerError,
                    "حدث خطأ أثناء جلب سجلات فشل التحقق");
            }
        }
    }
}
