using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Lawyer.Application.Dtos.Reviews;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lawyer.Application.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ReviewService> _logger;

        public ReviewService(IUnitOfWork unitOfWork, ILogger<ReviewService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<Lawyer.Core.Common.PagedResponse<ReviewDto>>> GetAllReviewsAsync(string? status, int pageNumber, int pageSize, CancellationToken ct)
        {
            var query = _unitOfWork.Repository<Review>()
                .AsQueryable()
                .Include(r => r.Lawyer)
                    .ThenInclude(l => l!.ApplicationUser)
                .OrderByDescending(r => r.Created);

            var filtered = !string.IsNullOrWhiteSpace(status)
                ? query.Where(r => r.Status == status)
                : query;

            var totalRecords = await filtered.CountAsync(ct);

            var reviews = await filtered
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ReviewDto
            {
                Id = r.Id,
                LawyerId = r.LawyerId.ToString(),
                LawyerName = r.Lawyer != null && r.Lawyer.ApplicationUser != null
                    ? r.Lawyer.ApplicationUser.FullName ?? ""
                    : "",
                ReviewerName = r.ReviewerName,
                ReviewerRole = r.ReviewerRole,
                Rating = r.Rating,
                Comment = r.Comment,
                Status = r.Status,
                Created = r.Created,
            }).ToListAsync(ct);

            var pagedResponse = new Lawyer.Core.Common.PagedResponse<ReviewDto>(reviews, pageNumber, pageSize, totalRecords);
            return ApiExceptionResponse.Success(pagedResponse, "Reviews retrieved successfully");
        }

        public async Task<Result<ReviewDto>> UpdateReviewStatusAsync(Guid id, string status, CancellationToken ct)
        {
            var validStatuses = new[] { "Approved", "Rejected", "Pending" };
            if (!validStatuses.Contains(status))
                return ApiExceptionResponse.BadRequest<ReviewDto>("Invalid status. Use: Approved, Rejected, or Pending.");

            var review = await _unitOfWork.Repository<Review>()
                .AsQueryable()
                .Include(r => r.Lawyer)
                    .ThenInclude(l => l!.ApplicationUser)
                .FirstOrDefaultAsync(r => r.Id == id, ct);

            if (review == null)
                return ApiExceptionResponse.NotFound<ReviewDto>("Review not found.");

            review.Status = status;
            review.Updated = DateTime.UtcNow;
            await _unitOfWork.Repository<Review>().Update(review);
            await _unitOfWork.SaveChangesAsync(ct);

            _logger.LogInformation("Review {ReviewId} status updated to {Status}", id, status);

            return ApiExceptionResponse.Success(new ReviewDto
            {
                Id = review.Id,
                LawyerId = review.LawyerId.ToString(),
                LawyerName = review.Lawyer?.ApplicationUser?.FullName ?? "",
                ReviewerName = review.ReviewerName,
                ReviewerRole = review.ReviewerRole,
                Rating = review.Rating,
                Comment = review.Comment,
                Status = review.Status,
                Created = review.Created,
            }, "Review status updated successfully");
        }
    }
}
