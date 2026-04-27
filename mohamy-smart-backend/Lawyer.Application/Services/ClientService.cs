using Lawyer.Application.Dtos.Client;
using Lawyer.Application.IServices;
using Lawyer.Application.Common;
using Lawyer.Core.Common;
using Lawyer.Core.Common.Extension;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
	public class ClientService : IClientService
	{
		private readonly IUnitOfWork _unitOfWork;
		private readonly ILogger<ClientService> _logger;
		private readonly Lawyer.Application.Common.Interface.IFileUploadService _fileUploadService;

		public ClientService(
			IUnitOfWork unitOfWork,
			ILogger<ClientService> logger,
			Lawyer.Application.Common.Interface.IFileUploadService fileUploadService)
		{
			_unitOfWork = unitOfWork;
			_logger = logger;
			_fileUploadService = fileUploadService;
		}

		public async Task<Result<ClientDto>> CreateClientAsync(CreateClientDto dto, Guid lawyerId, CancellationToken cancellationToken)
		{
			if (dto.CaseId.HasValue)
			{
				var caseEntity = await _unitOfWork.Repository<Case>()
					.FirstOrDefaultAsync(x => x.Id == dto.CaseId.Value, cancellationToken);

				if (caseEntity == null)
					return ApiExceptionResponse.NotFound<ClientDto>("Case not found");

				if (caseEntity.LawyerId != lawyerId)
					return ApiExceptionResponse.BadRequest<ClientDto>("Case does not belong to this lawyer");
			}

			var entity = new Client
			{
				ClientName = dto.ClientName,
				PhoneNumber = dto.PhoneNumber,
				Email = dto.Email ?? string.Empty,
				Notes = dto.Notes ?? string.Empty,
				Address = dto.Address ?? string.Empty,
				NationalId = dto.NationalId ?? string.Empty,
				Governorate = dto.Governorate ?? string.Empty,
				LawyerId = lawyerId
			};

			await _unitOfWork.Repository<Client>().AddAsync(entity);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("Client created successfully: {ClientName}", entity.ClientName);

			return ApiExceptionResponse.Success(MapToDto(entity), "Client created successfully");
		}

		public async Task<Result<ClientDto>> GetByIdAsync(Guid id, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken)
		{
			var dto = await _unitOfWork.Repository<Client>()
				.AsQueryable()
				.AsNoTracking()
				.Where(x => x.Id == id)
				.Select(x => new ClientDto
				{
					Id = x.Id,
					ClientName = x.ClientName,
					PhoneNumber = x.PhoneNumber,
					Email = x.Email,
					Notes = x.Notes,
					Address = x.Address,
					NationalId = x.NationalId,
					Governorate = x.Governorate,
					LawyerId = x.LawyerId,
					CaseId = null,
					CreationDate = x.Created,
					Cases = x.Cases.Select(c => new ClientCaseSummaryDto
					{
						Id = c.Id,
						Title = c.Title,
						Number = c.Number,
						Court = c.Court,
						Status = c.Status,
						CreationDate = c.Created
					}).ToList(),
					Files = x.Files.Select(f => new ClientFileDto
					{
						Id = f.Id,
						FileName = f.FileName,
						FilePath = $"/api/v1/client-documents/{f.Id}/download",
						ContentType = f.ContentType,
						FileSize = f.FileSize,
						CreationDate = f.Created
					}).ToList()
				})
				.FirstOrDefaultAsync(cancellationToken);

			if (dto == null)
				return ApiExceptionResponse.NotFound<ClientDto>("Client not found");

			if (isLawyer && dto.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية الوصول إلى هذا الموكل.");

			return ApiExceptionResponse.Success(dto);
		}

		public async Task<Result<Lawyer.Application.Models.PaginatedList<ClientDto>>> GetAllAsync(
			int pageNumber,
			int pageSize,
			Guid? lawyerId,
			CancellationToken cancellationToken)
		{
			if (pageNumber <= 0) pageNumber = 1;
			pageSize = PaginationDefaults.ClampPageSize(pageSize);

			var query = _unitOfWork.Repository<Client>()
				.AsQueryable()
				.AsNoTracking()
				.Where(x => x.IsActive)
				.OrderByDescending(x => x.Created);

			if (lawyerId.HasValue)
				query = (IOrderedQueryable<Client>)query.Where(x => x.LawyerId == lawyerId.Value);

			var count = await query.CountAsync(cancellationToken);
			var items = await query
				.Skip((pageNumber - 1) * pageSize)
				.Take(pageSize)
				.Select(x => new ClientDto
				{
					Id = x.Id,
					ClientName = x.ClientName,
					PhoneNumber = x.PhoneNumber,
					Email = x.Email,
					Notes = x.Notes,
					LawyerId = x.LawyerId,
					CaseId = null,
					CreationDate = x.Created,
					Cases = new System.Collections.Generic.List<ClientCaseSummaryDto>()
				})
				.ToListAsync(cancellationToken);

			var pagedResult = new Lawyer.Application.Models.PaginatedList<ClientDto>(items, count, pageNumber, pageSize);

			_logger.LogInformation(
				"Retrieved {Count} clients for lawyer {LawyerId} on page {PageNumber}",
				pagedResult.Items.Count,
				lawyerId,
				pageNumber);

			return ApiExceptionResponse.Success(pagedResult, "Clients retrieved successfully");
		}

		public async Task<Result<ClientDto>> UpdateClientAsync(Guid id, UpdateClientDto dto, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<Client>().FirstOrDefaultAsync(x => x.Id == id);
			if (entity == null)
				return ApiExceptionResponse.NotFound<ClientDto>("Client not found");

			if (isLawyer && entity.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية تعديل هذا الموكل.");

			entity.ClientName = dto.ClientName;
			entity.PhoneNumber = dto.PhoneNumber;
			entity.Email = dto.Email ?? string.Empty;
			entity.Notes = dto.Notes ?? string.Empty;
			entity.Address = dto.Address ?? string.Empty;
			entity.NationalId = dto.NationalId ?? string.Empty;
			entity.Governorate = dto.Governorate ?? string.Empty;

			await _unitOfWork.Repository<Client>().Update(entity);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("Client updated: {ClientName}", entity.ClientName);

			return ApiExceptionResponse.Success(MapToDto(entity), "Client updated successfully");
		}

		public async Task<Result<bool>> DeleteClientAsync(Guid id, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<Client>().FirstOrDefaultAsync(x => x.Id == id);
			if (entity == null)
				return ApiExceptionResponse.NotFound<bool>("Client not found");

			if (isLawyer && entity.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية حذف هذا الموكل.");

			entity.IsActive = false;
			await _unitOfWork.SaveChangesAsync(cancellationToken);
			_logger.LogInformation("Client deleted: {ClientName}", entity.ClientName);
			return ApiExceptionResponse.Success(true, "Client deleted successfully");
		}

		public async Task<Result<ClientFileDto>> AddFileAsync(Guid clientId, IFormFile file, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken)
		{
			var client = await _unitOfWork.Repository<Client>().FirstOrDefaultAsync(x => x.Id == clientId);
			if (client == null)
				return ApiExceptionResponse.NotFound<ClientFileDto>("Client not found");

			if (isLawyer && client.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية تعديل ملفات هذا الموكل.");

			string filePath = await _fileUploadService.UploadClientFileAsync(file, clientId.ToString());

			var clientFile = new ClientFile
			{
				ClientId = clientId,
				FileName = file.FileName,
				FilePath = filePath,
				ContentType = file.ContentType,
				FileSize = file.Length
			};

			await _unitOfWork.Repository<ClientFile>().AddAsync(clientFile);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			return ApiExceptionResponse.Success(new ClientFileDto
			{
				Id = clientFile.Id,
				FileName = clientFile.FileName,
				FilePath = $"/api/v1/client-documents/{clientFile.Id}/download",
				ContentType = clientFile.ContentType,
				FileSize = clientFile.FileSize,
				CreationDate = clientFile.Created
			});
		}

		public async Task<Result<bool>> DeleteFileAsync(Guid clientId, Guid fileId, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken)
		{
			var client = await _unitOfWork.Repository<Client>().FirstOrDefaultAsync(x => x.Id == clientId);
			if (client == null)
				return ApiExceptionResponse.NotFound<bool>("Client not found");

			if (isLawyer && client.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية تعديل ملفات هذا الموكل.");

			var file = await _unitOfWork.Repository<ClientFile>().FirstOrDefaultAsync(x => x.Id == fileId && x.ClientId == clientId);
			if (file == null)
				return ApiExceptionResponse.NotFound<bool>("File not found");

			_unitOfWork.Repository<ClientFile>().Delete(file);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			return ApiExceptionResponse.Success(true, "File deleted successfully");
		}

		private static ClientDto MapToDto(Client entity)
		{
			return new ClientDto
			{
				Id = entity.Id,
				ClientName = entity.ClientName,
				PhoneNumber = entity.PhoneNumber,
				Email = entity.Email,
				Notes = entity.Notes,
				LawyerId = entity.LawyerId,
				CaseId = null,
				CreationDate = entity.Created,
				Cases = new System.Collections.Generic.List<ClientCaseSummaryDto>(),
				Files = entity.Files?.Select(f => new ClientFileDto
				{
					Id = f.Id,
					FileName = f.FileName,
					FilePath = $"/api/v1/client-documents/{f.Id}/download",
					ContentType = f.ContentType,
					FileSize = f.FileSize,
					CreationDate = f.Created
				}).ToList() ?? new System.Collections.Generic.List<ClientFileDto>()
			};
		}
	}
}
