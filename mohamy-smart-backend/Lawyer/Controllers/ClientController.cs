using Lawyer.Application.Common;
using Lawyer.Application.Dtos.Client;
using Lawyer.Application.IServices;
using Lawyer.Application.Services;
using Lawyer.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Controllers
{
	[Route("api/v1/[controller]")]
	[ApiController]
	[Authorize]
	public class ClientController : AppControllerBase
	{
		private readonly IClientService _service;
		private readonly ILogger<ClientController> _logger;
		private readonly IVirusScannerService _virusScanner;
		private readonly ILawyerIdResolver _lawyerIdResolver;
		private readonly IUserContextProvider _userContextProvider;

		public ClientController(IClientService service, ILogger<ClientController> logger, IVirusScannerService virusScanner, ILawyerIdResolver lawyerIdResolver, IUserContextProvider userContextProvider)
		{
			_service = service;
			_logger = logger;
			_virusScanner = virusScanner;
			_lawyerIdResolver = lawyerIdResolver;
			_userContextProvider = userContextProvider;
		}

		private bool IsLawyer() => User.IsInRole("Lawyer");

		[HttpPost("create")]
		public async Task<IActionResult> Create([FromBody] CreateClientDto model, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Creating new client: {ClientName}", model.ClientName);
			var userContext = _userContextProvider.GetCurrentContext();
			var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
			if (!lawyerIdResult.Succeeded)
				return CreateResponse(lawyerIdResult);
			var result = await _service.CreateClientAsync(model, lawyerIdResult.Data, cancellationToken);
			return CreateResponse(result);
		}

		[HttpGet]
		public async Task<IActionResult> GetAllClients(
			[FromQuery] int pageNumber = 1,
			[FromQuery] int pageSize = 10,
			[FromQuery] Guid? lawyerId = null,
			CancellationToken cancellationToken = default)
		{
			Guid? effectiveLawyerId = lawyerId;
			if (IsLawyer())
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				effectiveLawyerId = lawyerIdResult.Data;
			}
			var result = await _service.GetAllAsync(pageNumber, pageSize, effectiveLawyerId, cancellationToken);
			return CreateResponse(result);
		}

		[HttpGet("{id:guid}")]
		public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Fetching client by ID: {Id}", id);
			var isLawyer = IsLawyer();
			var lawyerId = Guid.Empty;
			if (isLawyer)
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				lawyerId = lawyerIdResult.Data;
			}
			var result = await _service.GetByIdAsync(id, isLawyer, lawyerId, cancellationToken);
			return CreateResponse(result);
		}

		[HttpPut("{id:guid}")]
		public async Task<IActionResult> Update(Guid id, [FromBody] UpdateClientDto model, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Updating client {Id}", id);
			var isLawyer = IsLawyer();
			var lawyerId = Guid.Empty;
			if (isLawyer)
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				lawyerId = lawyerIdResult.Data;
			}
			var result = await _service.UpdateClientAsync(id, model, isLawyer, lawyerId, cancellationToken);
			return CreateResponse(result);
		}

		[HttpDelete("{id:guid}")]
		public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Deleting client {Id}", id);
			var isLawyer = IsLawyer();
			var lawyerId = Guid.Empty;
			if (isLawyer)
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				lawyerId = lawyerIdResult.Data;
			}
			var result = await _service.DeleteClientAsync(id, isLawyer, lawyerId, cancellationToken);
			return CreateResponse(result);
		}

		[HttpPost("{clientId:guid}/files")]
		public async Task<IActionResult> UploadFile(Guid clientId, Microsoft.AspNetCore.Http.IFormFile file, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Uploading file for client {Id}", clientId);
			if (file == null || file.Length == 0)
				return BadRequest("الملف فارغ.");

			if (file.Length > 200L * 1024 * 1024)
				return BadRequest("حجم الملف كبير جداً. الحد الأقصى 200 ميجابايت.");

			var safe = await _virusScanner.IsSafeAsync(file, cancellationToken);
			if (!safe)
				return BadRequest("الملف يحتوي على محتوى ضار");

			var isLawyer = IsLawyer();
			var lawyerId = Guid.Empty;
			if (isLawyer)
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				lawyerId = lawyerIdResult.Data;
			}
			var result = await _service.AddFileAsync(clientId, file, isLawyer, lawyerId, cancellationToken);
			return CreateResponse(result);
		}

		[HttpDelete("{clientId:guid}/files/{fileId:guid}")]
		public async Task<IActionResult> DeleteFile(Guid clientId, Guid fileId, CancellationToken cancellationToken)
		{
			_logger.LogInformation("Deleting file {FileId} for client {ClientId}", fileId, clientId);
			var isLawyer = IsLawyer();
			var lawyerId = Guid.Empty;
			if (isLawyer)
			{
				var userContext = _userContextProvider.GetCurrentContext();
				var lawyerIdResult = await _lawyerIdResolver.ResolveAsync(userContext, null, cancellationToken);
				if (!lawyerIdResult.Succeeded)
					return CreateResponse(lawyerIdResult);
				lawyerId = lawyerIdResult.Data;
			}
			var result = await _service.DeleteFileAsync(clientId, fileId, isLawyer, lawyerId, cancellationToken);
			return CreateResponse(result);
		}
	}
}
