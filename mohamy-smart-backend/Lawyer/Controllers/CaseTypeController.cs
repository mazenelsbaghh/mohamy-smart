using Lawyer.Application.Dtos.CaseType;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Controllers
{
	[Route("api/v1/[controller]")]
	[ApiController]
	[Authorize]
	public class CaseTypeController : AppControllerBase
	{
		private readonly ICaseTypeService _service;

		public CaseTypeController(ICaseTypeService service)
		{
			_service = service;
		}

		[HttpGet]
		[OutputCache(Duration = 3600)] // Cache for 1 hour
		public async Task<IActionResult> GetAll(
			[FromQuery] string? searchQuery = null,
			[FromQuery] int pageNumber = 1,
			[FromQuery] int pageSize = 10,
			CancellationToken cancellationToken = default)
		{
			var result = await _service.GetAllAsync(searchQuery ?? string.Empty, pageNumber, pageSize, cancellationToken);
			return CreateResponse(result);
		}

		[HttpGet("{id:int}")]
		[OutputCache(Duration = 3600)]
		public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
		{
			var result = await _service.GetByIdAsync(id, cancellationToken);
			return CreateResponse(result);
		}

		[HttpPost("create")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> Create([FromBody] CreateCaseTypeDto model, CancellationToken cancellationToken)
		{
			var result = await _service.CreateAsync(model, cancellationToken);
			return CreateResponse(result);
		}

		[HttpPut("{id:int}")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> Update(int id, [FromBody] UpdateCaseTypeDto model, CancellationToken cancellationToken)
		{
			var result = await _service.UpdateAsync(id, model, cancellationToken);
			return CreateResponse(result);
		}

		[HttpDelete("{id:int}")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
		{
			var result = await _service.DeleteAsync(id, cancellationToken);
			return CreateResponse(result);
		}
	}
}
