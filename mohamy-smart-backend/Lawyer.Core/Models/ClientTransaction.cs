using Lawyer.Core.Enums;
using System;

namespace Lawyer.Core.Models
{
    public class ClientTransaction : BaseEntity<Guid>
    {
        public Guid ClientId { get; set; }
        public Client Client { get; set; } = null!;

        public TransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
    }
}
