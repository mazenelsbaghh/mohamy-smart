using System;
using System.Threading;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Lawyer.Application.Common;
using Lawyer.Application.Dtos.ProcessServerPaper;
using Lawyer.Application.IServices;
using Lawyer.Application.Services;
using Lawyer.Controllers.Base;
using Lawyer.Core.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize]
    public class ProcessServerPaperController : AppControllerBase
    {
        private readonly IProcessServerPaperService _service;
        private readonly IVirusScannerService _virusScanner;
        private readonly ILawyerIdResolver _lawyerIdResolver;
        private readonly IUserContextProvider _userContextProvider;

        public ProcessServerPaperController(IProcessServerPaperService service, IVirusScannerService virusScanner, ILawyerIdResolver lawyerIdResolver, IUserContextProvider userContextProvider)
        {
            _service = service;
            _virusScanner = virusScanner;
            _lawyerIdResolver = lawyerIdResolver;
            _userContextProvider = userContextProvider;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] Guid? clientId = null,
            [FromQuery] Guid? caseId = null,
            [FromQuery] ProcessServerPaperStatus? status = null,
            [FromQuery] ProcessServerPaperType? type = null,
            CancellationToken cancellationToken = default)
        {
            var userContext = _userContextProvider.GetCurrentContext();
            var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);
            var result = await _service.GetAllAsync(lawyerIdResult.Data, clientId, caseId, status, type, cancellationToken);
            return CreateResponse(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var userContext = _userContextProvider.GetCurrentContext();
            var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);
            var result = await _service.GetByIdAsync(id, lawyerIdResult.Data, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProcessServerPaperDto dto, CancellationToken cancellationToken)
        {
            var userContext = _userContextProvider.GetCurrentContext();
            var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);
            var result = await _service.CreateAsync(dto, lawyerIdResult.Data, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProcessServerPaperDto dto, CancellationToken cancellationToken)
        {
            var userContext = _userContextProvider.GetCurrentContext();
            var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);
            var result = await _service.UpdateAsync(id, dto, lawyerIdResult.Data, cancellationToken);
            return CreateResponse(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var userContext = _userContextProvider.GetCurrentContext();
            var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);
            var result = await _service.DeleteAsync(id, lawyerIdResult.Data, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPost("{id}/attachment")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadAttachment(Guid id, [Required] IFormFile file, CancellationToken cancellationToken)
        {
            if (file == null || file.Length == 0)
                return BadRequest("الملف فارغ.");

            if (file.Length > 200L * 1024 * 1024)
                return BadRequest("حجم الملف كبير جداً. الحد الأقصى 200 ميجابايت.");

            var safe = await _virusScanner.IsSafeAsync(file, cancellationToken);
            if (!safe)
                return BadRequest("الملف يحتوي على محتوى ضار");

            var userContext = _userContextProvider.GetCurrentContext();
            var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);
            var result = await _service.UploadAttachmentAsync(id, file, lawyerIdResult.Data, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPost("{id}/mark-served")]
        public async Task<IActionResult> MarkServed(Guid id, [FromBody] MarkServedDto dto, CancellationToken cancellationToken)
        {
            var userContext = _userContextProvider.GetCurrentContext();
            var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
            if (!lawyerIdResult.Succeeded)
                return CreateResponse(lawyerIdResult);
            var result = await _service.MarkServedAsync(id, dto, lawyerIdResult.Data, cancellationToken);
            return CreateResponse(result);
        }
    }
}
