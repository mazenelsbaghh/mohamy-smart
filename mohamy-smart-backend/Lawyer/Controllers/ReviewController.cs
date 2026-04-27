using Lawyer.Application.Dtos.Reviews;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ReviewController : AppControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllReviews([FromQuery] string? status, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
        {
            var result = await _reviewService.GetAllReviewsAsync(status, pageNumber, pageSize, ct);
            return CreateResponse(result);
        }

        [HttpPatch("{id:guid}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateReviewStatus(Guid id, [FromBody] UpdateReviewStatusDto dto, CancellationToken ct)
        {
            var result = await _reviewService.UpdateReviewStatusAsync(id, dto.Status, ct);
            return CreateResponse(result);
        }
    }
}
