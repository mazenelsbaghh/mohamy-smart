using Lawyer.Application.Dtos.Account;
using Lawyer.Application.Dto.Auth;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize]
    public class AccountController : AppControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdStr, out var userId))
                return userId;
            return Guid.Empty;
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsers(
            [FromQuery] UserType? userType,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            pageSize = Math.Min(pageSize, 100);
            var result = await _accountService.GetAllUsersAsync(userType, pageNumber, pageSize, cancellationToken);
            return CreateResponse(result);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _accountService.GetUserByIdAsync(id, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto, CancellationToken cancellationToken)
        {
            var result = await _accountService.UpdateUserAsync(id, dto, cancellationToken);
            return CreateResponse(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(Guid id, CancellationToken cancellationToken)
        {
            var result = await _accountService.DeleteUserAsync(id, cancellationToken);
            return CreateResponse(result);
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
        {
            var result = await _accountService.GetProfileAsync(GetUserId(), cancellationToken);
            return CreateResponse(result);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto, CancellationToken cancellationToken)
        {
            var result = await _accountService.UpdateProfileAsync(GetUserId(), dto, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request, CancellationToken cancellationToken)
        {
            var result = await _accountService.ChangePasswordAsync(GetUserId(), request.CurrentPassword, request.NewPassword, request.ConfirmPassword, request.OtpCode, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPost("request-otp")]
        public async Task<IActionResult> RequestOtp([FromBody] RequestAccountOtpDto dto, CancellationToken cancellationToken)
        {
            var result = await _accountService.RequestAccountOtpAsync(GetUserId(), dto, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyAccountOtpDto dto, CancellationToken cancellationToken)
        {
            var result = await _accountService.VerifyAccountOtpAsync(GetUserId(), dto, cancellationToken);
            return CreateResponse(result);
        }
    }
}
