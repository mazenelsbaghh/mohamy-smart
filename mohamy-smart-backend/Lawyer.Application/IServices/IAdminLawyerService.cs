using Lawyer.Core.Exceptions;
using Lawyer.Application.Dtos.Admin;
using Lawyer.Application.Dtos.Lawyers;

namespace Lawyer.Application.IServices
{
	public interface IAdminLawyerService
	{
		Task<Result<AdminLawyerDetailDto>> GetLawyerDetailAsync(Guid userId, CancellationToken cancellationToken);
		Task<Result<string>> UpdateLawyerStatusAsync(Guid lawyerId, bool isActive, CancellationToken cancellationToken);
		Task<Result<AdminPhoneVerificationResultDto>> VerifyPhoneManuallyAsync(Guid userId, AdminManualPhoneVerificationRequestDto dto, CancellationToken cancellationToken);
		Task<Result<AdjustAiPointsResultDto>> AdjustAiPointsAsync(Guid userId, int amount, CancellationToken cancellationToken);
		Task<Result<string>> AdminResetPasswordAsync(Guid userId, string newPassword, CancellationToken cancellationToken);
	}
}
