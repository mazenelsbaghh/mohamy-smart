using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
	public interface IAdminLawyerService
	{
		Task<Result<string>> UpdateLawyerStatusAsync(Guid lawyerId, bool isActive, CancellationToken cancellationToken);
	}
}
