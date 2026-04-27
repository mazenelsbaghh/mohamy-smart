using System;

namespace Lawyer.Application.Dtos.Contracts
{
    public class LegalContractDto
    {
        public Guid ContractId { get; set; }
        public string ContractType { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
        public bool DetailAvailable { get; set; }
    }
}
