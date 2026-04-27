using Lawyer.Application.Common.Interface;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.Extensions.Logging;

namespace Lawyer.Application.Services
{
	public class AdminLawyerService : IAdminLawyerService
	{
		private readonly IUnitOfWork _unitOfWork;
		private readonly ILogger<AdminLawyerService> _logger;
		private readonly IAuditService _audit;

		public AdminLawyerService(IUnitOfWork unitOfWork, ILogger<AdminLawyerService> logger, IAuditService audit)
		{
			_unitOfWork = unitOfWork;
			_logger = logger;
			_audit = audit;
		}

		public async Task<Result<string>> UpdateLawyerStatusAsync(Guid lawyerId, bool isActive, CancellationToken cancellationToken)
		{
			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
				.FirstOrDefaultAsync(l => l.Id == lawyerId, cancellationToken, l => l.ApplicationUser);

			if (lawyer == null)
				return ApiExceptionResponse.NotFound<string>("Lawyer not found");

			lawyer.IsActive = isActive;
			lawyer.Updated = DateTime.UtcNow;

			if (lawyer.ApplicationUser != null)
			{
				lawyer.ApplicationUser.IsActive = isActive;
			}

			await _unitOfWork.Repository<Core.Models.Lawyer>().Update(lawyer);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			var action = isActive ? "AdminActivatedLawyer" : "AdminSuspendedLawyer";
			_audit.Log(action, new { LawyerId = lawyerId });

			_logger.LogInformation("Lawyer {LawyerId} status updated to {IsActive}", lawyerId, isActive);

			return ApiExceptionResponse.Success("Lawyer status updated successfully", "Lawyer status updated successfully");
		}
	}
}
