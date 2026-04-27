using Lawyer.Application.Dto.Auth;
using Lawyer.Core.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface IAuthService
    {
        Task<Result<AuthResponseDto>> Login(LoginDto request, CancellationToken cancellationToken);
        Task<Result<AuthResponseDto>> AdminLogin(AdminLoginDto request, CancellationToken cancellationToken);
        Task<Result<AuthResponseDto>> Register(RegisterDto request, CancellationToken cancellationToken);
		Task<Result<string>> RequestPhoneVerificationAsync(RequestPhoneVerificationDto request, CancellationToken cancellationToken);
		Task<Result<bool>> VerifyPhoneNumberAsync(VerifyPhoneNumberDto request, CancellationToken cancellationToken);
		Task<Result<string>> ForgetPasswordAsync(ForgetPasswordDto request, CancellationToken cancellationToken);
		Task<Result<bool>> VerifyOtpAsync(VerifyOtpDto request, CancellationToken cancellationToken);
		Task<Result<string>> ResetPasswordAsync(ResetPasswordDto request, CancellationToken cancellationToken);
		Task<Result<AuthResponseDto>> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken);
		Task<Result<bool>> RevokeRefreshTokenAsync(RevokeRefreshTokenRequest request, CancellationToken cancellationToken);
	}
}
