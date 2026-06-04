using Lawyer.Application.Dto.Auth;
using Lawyer.Application.Dtos.Account;
using Lawyer.Core.Common;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
	public interface IAccountService
	{
		Task<Result<PagedResponse<UserToReturnDto>>> GetAllUsersAsync(
	UserType? filterByUserType,
	int pageNumber,
	int pageSize,
	string? search,
	bool? isActive,
	bool? subscriptionIsActive,
	CancellationToken cancellationToken);

		Task<Result<UserToReturnDto>> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken);

		Task<Result<UserToReturnDto>> UpdateUserAsync(Guid userId, UpdateUserDto dto, CancellationToken cancellationToken);
		Task<Result<string>> DeleteUserAsync(Guid userId, CancellationToken cancellationToken);
		Task<Result<ProfileDto>> GetProfileAsync(Guid userId, CancellationToken cancellationToken);
		Task<Result<ProfileDto>> UpdateProfileAsync(Guid userId, UpdateProfileDto dto, CancellationToken cancellationToken);
		Task<Result<string>> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, string confirmPassword, string otpCode, CancellationToken cancellationToken);
		Task<Result<string>> RequestAccountOtpAsync(Guid userId, RequestAccountOtpDto dto, CancellationToken cancellationToken);
		Task<Result<bool>> VerifyAccountOtpAsync(Guid userId, VerifyAccountOtpDto dto, CancellationToken cancellationToken);
		Task<Result<string>> RequestChangePhoneAsync(Guid userId, ChangePhoneRequestDto dto, CancellationToken cancellationToken);
		Task<Result<string>> VerifyChangePhoneAsync(Guid userId, ChangePhoneVerifyDto dto, CancellationToken cancellationToken);
		Task<bool> LogoutAsync(string userId);
		Task<bool> LogoutAllDevicesAsync(string userId);
	}
}
