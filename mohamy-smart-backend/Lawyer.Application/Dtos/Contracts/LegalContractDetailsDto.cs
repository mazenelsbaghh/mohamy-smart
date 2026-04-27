using System;
using Lawyer.Core.Enum;

namespace Lawyer.Application.Dtos.Contracts
{
    /// <summary>
    /// Full details of a generated legal contract (returned from POST and GET /api/LegalContracts/{id})
    /// </summary>
    public class LegalContractDetailsDto
    {
        public Guid ContractId { get; set; }
        public string ContractTypeCode { get; set; } = string.Empty;
        public string ContractTypeName { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string InputDetails { get; set; } = string.Empty;
        public string? CustomClauses { get; set; }
        public string GeneratedContent { get; set; } = string.Empty;
        public LegalContractStatus Status { get; set; }
        public AiStepType AiStepType { get; set; }
        public string? ModelIdentifier { get; set; }
        public DateTime CreatedAtUtc { get; set; }
    }
}
