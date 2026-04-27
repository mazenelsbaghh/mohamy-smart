using Lawyer.Application.Dtos.Client;
using Lawyer.Core.Common;
using Lawyer.Core.Exceptions;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
	public interface IClientService
	{
		Task<Result<ClientDto>> CreateClientAsync(CreateClientDto dto, Guid lawyerId, CancellationToken cancellationToken);
		Task<Result<ClientDto>> GetByIdAsync(Guid id, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken);
		Task<Result<Lawyer.Application.Models.PaginatedList<ClientDto>>> GetAllAsync(
			int pageNumber,
			int pageSize,
			Guid? lawyerId,
			CancellationToken cancellationToken);
		Task<Result<ClientDto>> UpdateClientAsync(Guid id, UpdateClientDto dto, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken);
		Task<Result<bool>> DeleteClientAsync(Guid id, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken);
		Task<Result<ClientFileDto>> AddFileAsync(Guid clientId, Microsoft.AspNetCore.Http.IFormFile file, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken);
		Task<Result<bool>> DeleteFileAsync(Guid clientId, Guid fileId, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken);
	}
}
