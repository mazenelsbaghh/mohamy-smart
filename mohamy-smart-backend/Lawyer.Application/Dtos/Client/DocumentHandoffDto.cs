using Microsoft.AspNetCore.Http;
using System;

namespace Lawyer.Application.DTOs.Client
{
    public class DocumentHandoffDto
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public DateTime DeliveryDate { get; set; }
        public string? ReceiptFilePath { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateDocumentHandoffDto
    {
        public Guid ClientId { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public DateTime DeliveryDate { get; set; }
        public IFormFile? ReceiptFile { get; set; }
    }
}
