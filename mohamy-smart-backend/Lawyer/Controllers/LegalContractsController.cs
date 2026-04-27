using Lawyer.Application.Dtos.Contracts;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(Roles = "Lawyer")]
    public class LegalContractsController : AppControllerBase
    {
        private readonly ILegalContractService _contractService;
        private readonly IUnitOfWork _unitOfWork;

        public LegalContractsController(ILegalContractService contractService, IUnitOfWork unitOfWork)
        {
            _contractService = contractService;
            _unitOfWork = unitOfWork;
        }

        private async Task<Guid> GetLawyerIdAsync(CancellationToken cancellationToken)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(idClaim, out var userId))
            {
                var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
                    .FirstOrDefaultAsync(l => l.ApplicationUserId == userId, cancellationToken);
                
                if (lawyer != null)
                    return lawyer.Id;
            }
            return Guid.Empty;
        }

        private Guid GetUserId()
        {
            var idClaim = User.FindFirst("UserId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
        }

        [HttpGet("types")]
        public async Task<IActionResult> GetContractTypes(CancellationToken cancellationToken)
        {
            var result = await _contractService.GetAvailableContractTypesAsync(cancellationToken);
            return CreateResponse(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateContract([FromBody] CreateLegalContractRequestDto request, CancellationToken cancellationToken)
        {
            var lawyerId = await GetLawyerIdAsync(cancellationToken);
            if (lawyerId == Guid.Empty)
                return Unauthorized("Lawyer profile not found");

            var userId = GetUserId();

            var result = await _contractService.CreateLegalContractAsync(lawyerId, userId, request, cancellationToken);
            return CreateResponse(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetContracts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        {
            var lawyerId = await GetLawyerIdAsync(cancellationToken);
            if (lawyerId == Guid.Empty)
                return Unauthorized("Lawyer profile not found");

            var result = await _contractService.GetLegalContractsAsync(lawyerId, pageNumber, pageSize, cancellationToken);
            return CreateResponse(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetContractDetails(Guid id, CancellationToken cancellationToken)
        {
            var lawyerId = await GetLawyerIdAsync(cancellationToken);
            if (lawyerId == Guid.Empty)
                return Unauthorized("Lawyer profile not found");

            var result = await _contractService.GetLegalContractDetailsAsync(lawyerId, id, cancellationToken);
            return CreateResponse(result);
        }
    }
}
