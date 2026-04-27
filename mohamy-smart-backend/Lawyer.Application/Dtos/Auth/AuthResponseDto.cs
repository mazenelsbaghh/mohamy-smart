using Lawyer.Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Dto.Auth
{
	public class AuthResponseDto
	{
		public string AccessToken { get; set; } = string.Empty;
		public string RefreshToken { get; set; } = string.Empty;
		public string ProfileId { get; set; } = string.Empty;
		public string UserId { get; set; } = string.Empty;
		public string FullName { get; set; } = string.Empty;
		public string Phone { get; set; } = string.Empty;
		public bool PhoneNumberConfirmed { get; set; }
		public bool RequiresPhoneVerification { get; set; }
		public List<string> Roles { get; set; } = new();
	}

	public class TokenRequest
	{
		public string RefreshToken { get; set; } = string.Empty;

	}

	public class ForgetPasswordDto
	{
		public string? PhoneNumber { get; set; }
	}

	public class VerifyOtpDto
	{
		public string PhoneNumber { get; set; } = string.Empty;
		public string Code { get; set; } = null!;
	}

	public class RequestPhoneVerificationDto
	{
		public string PhoneNumber { get; set; } = string.Empty;
	}

	public class VerifyPhoneNumberDto
	{
		public string PhoneNumber { get; set; } = string.Empty;
		public string Code { get; set; } = string.Empty;
	}

	public class ResetPasswordDto
	{
		public string PhoneNumber { get; set; } = string.Empty;
		public string OtpCode { get; set; } = null!;
		public string NewPassword { get; set; } = null!;
	}
	public class RefreshTokenRequest
	{
		public string RefreshToken { get; set; } = null!;
	}

	public class RevokeRefreshTokenRequest
	{
		public string RefreshToken { get; set; } = null!;
	}



}
