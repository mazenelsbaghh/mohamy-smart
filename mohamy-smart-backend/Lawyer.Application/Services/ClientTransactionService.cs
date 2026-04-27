using Lawyer.Application.Interfaces;
using Lawyer.Core.Enums;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class ClientTransactionService : IClientTransactionService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ClientTransactionService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<IEnumerable<ClientTransactionDto>>> GetByClientAsync(Guid clientId)
        {
            try
            {
                var items = await _unitOfWork.Repository<ClientTransaction>()
                    .AsQueryable()
                    .Where(t => t.ClientId == clientId)
                    .OrderByDescending(t => t.TransactionDate)
                    .Select(t => new ClientTransactionDto
                    {
                        Id = t.Id,
                        ClientId = t.ClientId,
                        Type = t.Type.ToString(),
                        Amount = t.Amount,
                        Description = t.Description,
                        TransactionDate = t.TransactionDate,
                        CreatedAt = t.Created
                    })
                    .ToListAsync();

                return Result<IEnumerable<ClientTransactionDto>>.Success(items);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ClientTransactionDto>>.Error(
                    System.Net.HttpStatusCode.InternalServerError,
                    "An error occurred while fetching transactions.");
            }
        }

        public async Task<Result<ClientTransactionDto>> CreateAsync(CreateClientTransactionDto dto, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!Enum.TryParse<TransactionType>(dto.Type, out var type))
                    return Result<ClientTransactionDto>.Error(
                        System.Net.HttpStatusCode.BadRequest,
                        "Invalid transaction type. Must be 'Income' or 'Expense'.");

                var entity = new ClientTransaction
                {
                    ClientId = dto.ClientId,
                    Type = type,
                    Amount = dto.Amount,
                    Description = dto.Description,
                    TransactionDate = dto.TransactionDate
                };

                await _unitOfWork.Repository<ClientTransaction>().AddAsync(entity);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result<ClientTransactionDto>.Success(new ClientTransactionDto
                {
                    Id = entity.Id,
                    ClientId = entity.ClientId,
                    Type = entity.Type.ToString(),
                    Amount = entity.Amount,
                    Description = entity.Description,
                    TransactionDate = entity.TransactionDate,
                    CreatedAt = entity.Created
                });
            }
            catch (Exception ex)
            {
                return Result<ClientTransactionDto>.Error(
                    System.Net.HttpStatusCode.InternalServerError,
                    "An error occurred while creating the transaction.");
            }
        }
    }
}
