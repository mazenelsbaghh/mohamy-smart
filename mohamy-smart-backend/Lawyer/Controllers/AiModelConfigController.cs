using Lawyer.Application.Dtos.AiModelConfig;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using System.Security.Claims;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AiModelConfigController : AppControllerBase
    {
        private readonly IAiModelConfigService _service;

        public AiModelConfigController(IAiModelConfigService service)
        {
            _service = service;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        [OutputCache(Duration = 300)]
        public async Task<IActionResult> GetAllConfigs(CancellationToken cancellationToken)
        {
            var result = await _service.GetAllConfigsAsync(cancellationToken);
            return CreateResponse(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<IActionResult> UpdateConfigs([FromBody] UpdateAiModelConfigRequest request, CancellationToken cancellationToken)
        {
            var adminEmail = User.FindFirst(ClaimTypes.Email)?.Value
                ?? User.FindFirst(ClaimTypes.Name)?.Value
                ?? "admin";

            var result = await _service.UpdateConfigsAsync(request, adminEmail, cancellationToken);
            return CreateResponse(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("models")]
        [OutputCache(Duration = 86400)] // Rarely changes
        public IActionResult GetAvailableModels()
        {
            var result = _service.GetAvailableModels();
            return CreateResponse(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("stages")]
        [OutputCache(Duration = 86400)] // Rarely changes
        public IActionResult GetAllStages()
        {
            var result = _service.GetAllStages();
            return CreateResponse(result);
        }
    }
}
