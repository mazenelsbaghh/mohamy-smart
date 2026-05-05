using System;
using Lawyer.Core.Enum;
using Lawyer.Application.Dtos.Client;

namespace Lawyer.Application.Dtos.ProcessServerPaper
{
    public class ProcessServerPaperDto
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public Guid? CaseId { get; set; }
        public ProcessServerPaperType PaperType { get; set; }
        public string? OtherPaperType { get; set; }
        public string? CustomPaperTypeTitle { get; set; }
        public string TargetName { get; set; } = string.Empty;
        public string? ProcessServerName { get; set; }
        public string? DeliveryNumber { get; set; }
        public ProcessServerPaperStatus Status { get; set; }
        public string? Notes { get; set; }
        public string? AttachmentUrl { get; set; }
        public DateTime? ServedDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public ClientDto? Client { get; set; }
        public object? Case { get; set; } // Map to minimal CaseDto if needed
    }
}
