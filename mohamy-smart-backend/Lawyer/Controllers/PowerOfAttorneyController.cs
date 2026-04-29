using Lawyer.Application.Common;
using Lawyer.Application.DTOs.POA;
using Lawyer.Application.IServices;
using Lawyer.Application.Validators;
using Lawyer.Controllers.Base;
using FluentValidation;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class PowerOfAttorneyController : AppControllerBase
    {
        private readonly IPowerOfAttorneyService _poaService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IValidator<PowerOfAttorneyDto> _validator;
        private readonly ILawyerIdResolver _lawyerIdResolver;
        private readonly IUserContextProvider _userContextProvider;

        public PowerOfAttorneyController(IPowerOfAttorneyService poaService, IUnitOfWork unitOfWork, IValidator<PowerOfAttorneyDto> validator, ILawyerIdResolver lawyerIdResolver, IUserContextProvider userContextProvider)
        {
            _poaService = poaService;
            _unitOfWork = unitOfWork;
            _validator = validator;
            _lawyerIdResolver = lawyerIdResolver;
            _userContextProvider = userContextProvider;
        }

        private async Task<bool> ClientBelongsToLawyerAsync(Guid clientId, Guid lawyerId)
        {
            var client = await _unitOfWork.Repository<Client>()
                .FirstOrDefaultAsync(c => c.Id == clientId);
            return client != null && client.LawyerId == lawyerId;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PowerOfAttorneyDto dto, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage).FirstOrDefault());

            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin)
            {
                var userContext = _userContextProvider.GetCurrentContext();
                var lawyerResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
                if (!lawyerResult.Succeeded)
                    return CreateResponse(lawyerResult);
                if (!await ClientBelongsToLawyerAsync(dto.ClientId, lawyerResult.Data))
                    return Forbid();
            }

            var result = await _poaService.CreatePowerOfAttorneyAsync(dto);
            if (!result.Succeeded)
                return CreateResponse(result);

            return CreateResponse(result);
        }

        [HttpGet("client/{clientId}")]
        public async Task<IActionResult> GetByClient(Guid clientId, CancellationToken cancellationToken)
        {
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin)
            {
                var userContext = _userContextProvider.GetCurrentContext();
                var lawyerResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
                if (!lawyerResult.Succeeded)
                    return CreateResponse(lawyerResult);
                if (!await ClientBelongsToLawyerAsync(clientId, lawyerResult.Data))
                    return Forbid();
            }

            var result = await _poaService.GetPowerOfAttorneysByClientAsync(clientId);
            if (!result.Succeeded)
                return CreateResponse(result);

            return CreateResponse(result);
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken)
        {
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin)
            {
                var userContext = _userContextProvider.GetCurrentContext();
                var lawyerResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
                if (!lawyerResult.Succeeded)
                    return CreateResponse(lawyerResult);

                var poa = await _unitOfWork.Repository<Core.Models.PowerOfAttorney>()
                    .FirstOrDefaultAsync(p => p.Id == id);
                if (poa == null)
                    return NotFound();

                if (!await ClientBelongsToLawyerAsync(poa.ClientId, lawyerResult.Data))
                    return Forbid();
            }

            var result = await _poaService.CancelPowerOfAttorneyAsync(id);
            if (!result.Succeeded)
                return CreateResponse(result);

            return CreateResponse(result);
        }
    }
}
