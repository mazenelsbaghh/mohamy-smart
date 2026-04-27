using System;

namespace Lawyer.Core.Models
{
    public class DocumentHandoff : BaseEntity<Guid>
    {
        public Guid ClientId { get; set; }
        public Client Client { get; set; } = null!;

        public string DocumentName { get; set; } = string.Empty;
        public DateTime DeliveryDate { get; set; }
        
        public string? ReceiptFilePath { get; set; }
    }
}
