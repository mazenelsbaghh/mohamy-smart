using FluentValidation;
using Lawyer.Application.Dto.Auth;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;
using Lawyer.Filters;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace Lawyer.Controllers
{
    /// <summary>
    /// Authentication and authorization endpoints for lawyers and admins.
    /// </summary>
    [Route("api/v1/[controller]")]
    [ApiController]
    [EnableRateLimiting("auth")]
    public class AuthController : AppControllerBase
    {
        private readonly IAuthService _service;
        private readonly IValidator<RegisterDto> _registerValidator;
        private readonly IValidator<LoginDto> _loginValidator;
        private readonly IValidator<AdminLoginDto> _adminLoginValidator;
        private readonly IAntiforgery _antiforgery;
        private readonly IConfiguration _config;
        private readonly IHostEnvironment _env;
        private readonly IUnitOfWork _unitOfWork;

        public AuthController(
            IAuthService service,
            IValidator<RegisterDto> registerValidator,
            IValidator<LoginDto> loginValidator,
            IValidator<AdminLoginDto> adminLoginValidator,
            IAntiforgery antiforgery,
            IConfiguration config,
            IHostEnvironment env,
            IUnitOfWork unitOfWork)
        {
            _service = service;
            _registerValidator = registerValidator;
            _loginValidator = loginValidator;
            _adminLoginValidator = adminLoginValidator;
            _antiforgery = antiforgery;
            _config = config;
            _env = env;
            _unitOfWork = unitOfWork;
        }

        // ── Helper ────────────────────────────────────────────────────────────
        private void IssueAuthCookiesAndXsrf(AuthResponseDto data)
        {
            SetAuthCookies(Response, data.AccessToken, data.RefreshToken, _env.IsProduction());
            // Seed the XSRF-TOKEN cookie so Axios can read and echo it on the first state-changing request.
            _antiforgery.GetAndStoreTokens(HttpContext);
        }

        // ── T007: GET /api/auth/me ────────────────────────────────────────────
        /// <summary>
        /// Returns the current user's profile from JWT claims — no DB call.
        /// Used by route guards on app boot to hydrate Redux state.
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me(CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var name = User.FindFirstValue(ClaimTypes.GivenName) ?? User.FindFirstValue(ClaimTypes.Name);
            var email = User.FindFirstValue(ClaimTypes.Email) ?? "";
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var profileId = User.FindFirstValue("profile_id") ?? "";

            if (string.IsNullOrWhiteSpace(profileId) && Guid.TryParse(userId, out var parsedUserId) && roles.Contains("Lawyer"))
            {
                var lawyer = await _unitOfWork.Repository<Lawyer.Core.Models.Lawyer>()
                    .FirstOrDefaultAsync(x => x.ApplicationUserId == parsedUserId, cancellationToken);
                profileId = lawyer?.Id.ToString() ?? "";
            }

            return Ok(Result<object>.Success(new { userId, profileId, fullName = name, email, roles }));
        }

        // ── T008: GET /api/auth/csrf-token ───────────────────────────────────
        /// <summary>
        /// Refreshes the XSRF-TOKEN cookie and returns the header token value.
        /// Call this once after login; Axios reads the cookie automatically thereafter.
        /// </summary>
        [HttpGet("csrf-token")]
        [Authorize]
        public IActionResult CsrfToken()
        {
            var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
            return Ok(Result<object>.Success(new { token = tokens.RequestToken }));
        }

        // ── T009: POST /api/auth/logout ───────────────────────────────────────
        /// <summary>
        /// Revokes the refresh token server-side and expires all auth cookies.
        /// Requires CSRF header (state-changing endpoint).
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout(CancellationToken cancellationToken)
        {
            var prefix = _env.IsProduction() ? "__Host-" : "";
            var refreshTokenValue = Request.Cookies[$"{prefix}refresh"] ?? "";

            if (!string.IsNullOrEmpty(refreshTokenValue))
            {
                var revokeRequest = new RevokeRefreshTokenRequest { RefreshToken = refreshTokenValue };
                await _service.RevokeRefreshTokenAsync(revokeRequest, cancellationToken);
            }

            ClearAuthCookies(Response, _env.IsProduction());
            return Ok(Result<string>.Success("تم تسجيل الخروج بنجاح."));
        }

        // ── Register ──────────────────────────────────────────────────────────
        /// <summary>
        /// Register a new lawyer account.
        /// </summary>
        [HttpPost("register")]
        [RequireBrowserOtpRequest]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> Register([FromBody] RegisterDto model, CancellationToken cancellationToken)
        {
            var validationResult = await _registerValidator.ValidateAsync(model, cancellationToken);
            if (!validationResult.IsValid)
            {
                var errorMessages = validationResult.Errors.Select(error => error.ErrorMessage).ToList();
                return BadRequest(Result<Guid>.Error(System.Net.HttpStatusCode.BadRequest, errorMessages.FirstOrDefault()));
            }

            var result = await _service.Register(model, cancellationToken);
            return CreateResponse(result);
        }

        // ── Login ─────────────────────────────────────────────────────────────
        /// <summary>
        /// Authenticate a lawyer using phone number and password.
        /// T012: Sets httpOnly session + refresh cookies on success.
        /// </summary>
        [HttpPost("login")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> Login([FromForm] LoginDto model, CancellationToken cancellationToken)
        {
            var validationResult = await _loginValidator.ValidateAsync(model, cancellationToken);
            if (!validationResult.IsValid)
            {
                var errorMessages = validationResult.Errors.Select(error => error.ErrorMessage).ToList();
                return BadRequest(Result<Guid>.Error(System.Net.HttpStatusCode.BadRequest, errorMessages.FirstOrDefault()));
            }

            var result = await _service.Login(model, cancellationToken);

            if (result.Succeeded && result.Data != null)
            {
                IssueAuthCookiesAndXsrf(result.Data);

                // T011: Transition flag — strip tokens from body once all clients are on the new build.
                // Set Auth:ReturnTokensInBody=false in appsettings after ≥48h from deploy.
                if (!(_config.GetValue<bool?>("Auth:ReturnTokensInBody") ?? true))
                {
                    result.Data.AccessToken = string.Empty;
                    result.Data.RefreshToken = string.Empty;
                }
            }

            return CreateResponse(result);
        }

        // ── Admin Login ───────────────────────────────────────────────────────
        /// <summary>
        /// Authenticate an admin using email and password.
        /// T013: Sets httpOnly session + refresh cookies on success.
        /// </summary>
        [HttpPost("admin/login")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> AdminLogin([FromForm] AdminLoginDto model, CancellationToken cancellationToken)
        {
            var validationResult = await _adminLoginValidator.ValidateAsync(model, cancellationToken);
            if (!validationResult.IsValid)
            {
                var errorMessages = validationResult.Errors.Select(error => error.ErrorMessage).ToList();
                return BadRequest(Result<Guid>.Error(System.Net.HttpStatusCode.BadRequest, errorMessages.FirstOrDefault()));
            }

            var result = await _service.AdminLogin(model, cancellationToken);

            if (result.Succeeded && result.Data != null)
            {
                IssueAuthCookiesAndXsrf(result.Data);

                if (!(_config.GetValue<bool?>("Auth:ReturnTokensInBody") ?? true))
                {
                    result.Data.AccessToken = string.Empty;
                    result.Data.RefreshToken = string.Empty;
                }
            }

            return CreateResponse(result);
        }

        // ── OTP / Password Recovery (all exempt — unauthenticated flows) ──────

        /// <summary>Send or resend phone verification OTP after registration.</summary>
        [HttpPost("request-phone-verification")]
        [EnableRateLimiting("otp")]
        [RequireBrowserOtpRequest]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> RequestPhoneVerification([FromBody] RequestPhoneVerificationDto model, CancellationToken cancellationToken)
        {
            var result = await _service.RequestPhoneVerificationAsync(model, cancellationToken);
            return CreateResponse(result);
        }

        /// <summary>Confirm the phone number with an OTP after registration.</summary>
        [HttpPost("verify-phone-number")]
        [RequireBrowserOtpRequest]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> VerifyPhoneNumber([FromBody] VerifyPhoneNumberDto model, CancellationToken cancellationToken)
        {
            var result = await _service.VerifyPhoneNumberAsync(model, cancellationToken);
            return CreateResponse(result);
        }

        /// <summary>Initiate password reset by sending OTP to the registered phone number.</summary>
        [HttpPost("forget-password")]
        [EnableRateLimiting("otp")]
        [RequireBrowserOtpRequest]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> ForgetPassword([FromBody] ForgetPasswordDto model, CancellationToken cancellationToken)
        {
            var result = await _service.ForgetPasswordAsync(model, cancellationToken);
            return CreateResponse(result);
        }

        /// <summary>Verify a one-time password (OTP) for password reset.</summary>
        [HttpPost("verify-otp")]
        [EnableRateLimiting("otp")]
        [RequireBrowserOtpRequest]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto model, CancellationToken cancellationToken)
        {
            var result = await _service.VerifyOtpAsync(model, cancellationToken);
            return CreateResponse(result);
        }

        /// <summary>Set a new password after OTP verification.</summary>
        [HttpPost("reset-password")]
        [RequireBrowserOtpRequest]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model, CancellationToken cancellationToken)
        {
            var result = await _service.ResetPasswordAsync(model, cancellationToken);
            return CreateResponse(result);
        }

        // ── T026: Refresh token (cookie-first, body fallback for backward compat) ──
        /// <summary>
        /// Exchange a refresh token for a new access token.
        /// Reads from the refresh cookie if present; falls back to body for server-to-server clients.
        /// </summary>
        [HttpPost("refresh-token")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest? model, CancellationToken cancellationToken)
        {
            var prefix = _env.IsProduction() ? "__Host-" : "";
            var cookieRefresh = Request.Cookies[$"{prefix}refresh"];

            // Prefer cookie value (browser clients); fall back to body (server-to-server / legacy)
            var request = new RefreshTokenRequest
            {
                RefreshToken = cookieRefresh ?? model?.RefreshToken ?? string.Empty
            };

            var result = await _service.RefreshTokenAsync(request, cancellationToken);

            if (result.Succeeded && result.Data != null)
            {
                IssueAuthCookiesAndXsrf(result.Data);

                if (!(_config.GetValue<bool?>("Auth:ReturnTokensInBody") ?? true))
                {
                    result.Data.AccessToken = string.Empty;
                    result.Data.RefreshToken = string.Empty;
                }
            }

            return CreateResponse(result);
        }

        // ── Revoke refresh token ──────────────────────────────────────────────
        /// <summary>
        /// Revoke a refresh token to force re-authentication.
        /// Reads from cookie or body; requires CSRF token (authenticated state-changing endpoint).
        /// </summary>
        [HttpPost("revoke-refresh-token")]
        [Authorize]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RevokeRefreshToken([FromBody] RevokeRefreshTokenRequest? model, CancellationToken cancellationToken)
        {
            var prefix = _env.IsProduction() ? "__Host-" : "";
            var cookieRefresh = Request.Cookies[$"{prefix}refresh"];

            var request = new RevokeRefreshTokenRequest
            {
                RefreshToken = cookieRefresh ?? model?.RefreshToken ?? string.Empty
            };

            var result = await _service.RevokeRefreshTokenAsync(request, cancellationToken);
            if (result.Succeeded)
                ClearAuthCookies(Response, _env.IsProduction());

            return CreateResponse(result);
        }
    }
}
