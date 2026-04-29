using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public class ClientTransactionDto
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public string Type { get; set; } = string.Empty; // "Income" | "Expense"
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateClientTransactionDto
    {
        public Guid ClientId { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
    }

    public interface IClientTransactionService
    {
        Task<Result<IEnumerable<ClientTransactionDto>>> GetByClientAsync(Guid clientId);
        Task<Result<ClientTransactionDto>> CreateAsync(CreateClientTransactionDto dto, CancellationToken cancellationToken = default);
    }
}
