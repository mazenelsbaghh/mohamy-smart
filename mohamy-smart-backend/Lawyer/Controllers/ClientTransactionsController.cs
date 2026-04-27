using Lawyer.Application.Common;
using Lawyer.Application.Interfaces;
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
    public class ClientTransactionsController : AppControllerBase
    {
        private readonly IClientTransactionService _service;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IValidator<CreateClientTransactionDto> _validator;
        private readonly ILawyerIdResolver _lawyerIdResolver;
        private readonly IUserContextProvider _userContextProvider;

        public ClientTransactionsController(IClientTransactionService service, IUnitOfWork unitOfWork, IValidator<CreateClientTransactionDto> validator, ILawyerIdResolver lawyerIdResolver, IUserContextProvider userContextProvider)
        {
            _service = service;
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

            var result = await _service.GetByClientAsync(clientId);
            if (!result.Succeeded)
                return CreateResponse(result);
            return CreateResponse(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateClientTransactionDto dto, CancellationToken cancellationToken)
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

            var result = await _service.CreateAsync(dto, cancellationToken);
            if (!result.Succeeded)
                return CreateResponse(result);
            return CreateResponse(result);
        }
    }
}
