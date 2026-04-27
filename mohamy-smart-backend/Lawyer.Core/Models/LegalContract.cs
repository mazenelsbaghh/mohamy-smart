using Lawyer.Core.Enum;
using Microsoft.EntityFrameworkCore;

namespace Lawyer.Core.Models
{
    [Index(nameof(LawyerId))]
    [Index(nameof(ClientId))]
    [Index(nameof(CreatedAtUtc))]
    public class LegalContract
    {
        public Guid Id { get; set; }

        // Ownership
        public Guid LawyerId { get; set; }
        public Lawyer Lawyer { get; set; } = null!;

        public Guid ClientId { get; set; }
        public Client Client { get; set; } = null!;

        // Contract metadata
        public string ContractTypeCode { get; set; } = string.Empty;
        public string ContractTypeName { get; set; } = string.Empty;

        // Input supplied by the lawyer
        public string InputDetails { get; set; } = string.Empty;
        public string? CustomClauses { get; set; }

        // AI-generated output
        public string? GeneratedContent { get; set; }
        public LegalContractStatus Status { get; set; } = LegalContractStatus.DraftingRequested;

        // AI tracing: which step type and which model identifier was used
        public AiStepType AiStepType { get; set; } = AiStepType.LegalContractDraft;
        public string? ModelIdentifier { get; set; }

        // Error tracking
        public string? LastErrorMessage { get; set; }

        // Audit
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public Guid CreatedByUserId { get; set; }
    }
}
