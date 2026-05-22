using Lawyer.Controllers.Base;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Controllers
{
	[Route("api/v1/[controller]")]
	[ApiController]
	[Authorize]
	public class GuidanceDismissalController : AppControllerBase
	{
		private readonly IUnitOfWork _unitOfWork;

		public GuidanceDismissalController(IUnitOfWork unitOfWork)
		{
			_unitOfWork = unitOfWork;
		}

		[HttpPost]
		public async Task<IActionResult> Dismiss([FromBody] DismissGuidanceRequest request, CancellationToken cancellationToken)
		{
			if (request == null || string.IsNullOrWhiteSpace(request.GuidanceKey))
			{
				return BadRequest(Result<string>.Error(System.Net.HttpStatusCode.BadRequest, "Guidance key is required."));
			}

			var userId = GetUserId();

			// Check if already exists
			var existing = await _unitOfWork.Repository<GuidanceDismissal>()
				.FirstOrDefaultAsync(g => g.UserId == userId && g.GuidanceKey == request.GuidanceKey, cancellationToken);

			if (existing == null)
			{
				var dismissal = new GuidanceDismissal
				{
					UserId = userId,
					GuidanceKey = request.GuidanceKey
				};

				await _unitOfWork.Repository<GuidanceDismissal>().AddAsync(dismissal);
				await _unitOfWork.SaveChangesAsync(cancellationToken);
			}

			return Ok(Result<string>.Success("تم حفظ عدم الإظهار بنجاح."));
		}
	}

	public class DismissGuidanceRequest
	{
		public string GuidanceKey { get; set; } = string.Empty;
	}
}
