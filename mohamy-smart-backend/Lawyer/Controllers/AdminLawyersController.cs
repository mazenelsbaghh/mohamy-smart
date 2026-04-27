using Lawyer.Application.Dtos.Account;
using Lawyer.Application.Dtos.Lawyers;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lawyer.Controllers
{
    [Route("api/v1/lawyers")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminLawyersController : AppControllerBase
    {
        private readonly IAdminLawyerService _adminLawyerService;
        private readonly IAccountService _accountService;

        public AdminLawyersController(IAdminLawyerService adminLawyerService, IAccountService accountService)
        {
            _adminLawyerService = adminLawyerService;
            _accountService = accountService;
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetLawyerById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _accountService.GetUserByIdAsync(id, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateLawyerStatus(Guid id, [FromBody] UpdateLawyerStatusDto dto, CancellationToken cancellationToken)
        {
            var result = await _adminLawyerService.UpdateLawyerStatusAsync(id, dto.IsActive, cancellationToken);
            return CreateResponse(result);
        }
    }
}
