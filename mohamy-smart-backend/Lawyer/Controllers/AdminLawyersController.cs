using Lawyer.Application.Dtos.Admin;
using Lawyer.Application.Dtos.Lawyers;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lawyer.Controllers
{
    [Route("api/v1/lawyers")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminLawyersController : AppControllerBase
    {
        private readonly IAdminLawyerService _adminLawyerService;

        public AdminLawyersController(IAdminLawyerService adminLawyerService)
        {
            _adminLawyerService = adminLawyerService;
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetLawyerById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _adminLawyerService.GetLawyerDetailAsync(id, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateLawyerStatus(Guid id, [FromBody] UpdateLawyerStatusDto dto, CancellationToken cancellationToken)
        {
            var result = await _adminLawyerService.UpdateLawyerStatusAsync(id, dto.IsActive, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPatch("{id:guid}/phone-verification")]
        public async Task<IActionResult> VerifyPhoneManually(Guid id, [FromBody] AdminManualPhoneVerificationRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _adminLawyerService.VerifyPhoneManuallyAsync(id, dto, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPatch("{id:guid}/ai-points")]
        public async Task<IActionResult> AdjustAiPoints(Guid id, [FromBody] AdjustAiPointsRequest dto, CancellationToken cancellationToken)
        {
            var result = await _adminLawyerService.AdjustAiPointsAsync(id, dto.Amount, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPatch("{id:guid}/password")]
        public async Task<IActionResult> ResetPassword(Guid id, [FromBody] AdminResetPasswordRequest dto, CancellationToken cancellationToken)
        {
            var result = await _adminLawyerService.AdminResetPasswordAsync(id, dto.NewPassword, cancellationToken);
            return CreateResponse(result);
        }
    }
}

