using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class DocumentsController : AppControllerBase
    {
        private readonly IDocumentWorkspaceService _documentWorkspaceService;
        private readonly IUnitOfWork _unitOfWork;

        public DocumentsController(IDocumentWorkspaceService documentWorkspaceService, IUnitOfWork unitOfWork)
        {
            _documentWorkspaceService = documentWorkspaceService;
            _unitOfWork = unitOfWork;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetDocuments(
            [FromQuery] Guid? caseId,
            [FromQuery] string state,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken ct = default)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

            var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
                .FirstOrDefaultAsync(l => l.ApplicationUserId == Guid.Parse(userId));

            if (lawyer == null)
                return BadRequest(Result<string>.Error(System.Net.HttpStatusCode.BadRequest, "Lawyer profile not found."));

            var result = await _documentWorkspaceService.GetDocumentsAsync(lawyer.Id, caseId, state, pageNumber, pageSize, ct);
            return CreateResponse(result);
        }
    }
}
