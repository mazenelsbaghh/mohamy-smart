using Lawyer.Application.Common;
using Lawyer.Application.Dtos.InternalRegulations;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(Roles = "Lawyer")]
    public class InternalRegulationsController : AppControllerBase
    {
        private readonly IInternalRegulationService _service;
        private readonly ILawyerIdResolver _lawyerIdResolver;
        private readonly IUserContextProvider _userContextProvider;

        public InternalRegulationsController(
            IInternalRegulationService service,
            ILawyerIdResolver lawyerIdResolver,
            IUserContextProvider userContextProvider)
        {
            _service = service;
            _lawyerIdResolver = lawyerIdResolver;
            _userContextProvider = userContextProvider;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search = null,
            [FromQuery] bool includeArchived = false,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            var lawyerIdResult = await ResolveLawyerIdAsync(cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);

            var result = await _service.GetAllAsync(lawyerIdResult.Data, search, includeArchived, pageNumber, pageSize, cancellationToken);
            return CreateResponse(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var lawyerIdResult = await ResolveLawyerIdAsync(cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);

            var result = await _service.GetByIdAsync(id, lawyerIdResult.Data, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateInternalRegulationDto model, CancellationToken cancellationToken)
        {
            var lawyerIdResult = await ResolveLawyerIdAsync(cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);

            var result = await _service.CreateAsync(model, lawyerIdResult.Data, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInternalRegulationDto model, CancellationToken cancellationToken)
        {
            var lawyerIdResult = await ResolveLawyerIdAsync(cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);

            var result = await _service.UpdateAsync(id, model, lawyerIdResult.Data, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPatch("{id:guid}/archive")]
        public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken)
        {
            var lawyerIdResult = await ResolveLawyerIdAsync(cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);

            var result = await _service.SetArchiveStatusAsync(id, true, lawyerIdResult.Data, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPatch("{id:guid}/restore")]
        public async Task<IActionResult> Restore(Guid id, CancellationToken cancellationToken)
        {
            var lawyerIdResult = await ResolveLawyerIdAsync(cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);

            var result = await _service.SetArchiveStatusAsync(id, false, lawyerIdResult.Data, cancellationToken);
            return CreateResponse(result);
        }

        private Task<Result<Guid>> ResolveLawyerIdAsync(CancellationToken cancellationToken)
        {
            var userContext = _userContextProvider.GetCurrentContext();
            return _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
        }
    }
}
