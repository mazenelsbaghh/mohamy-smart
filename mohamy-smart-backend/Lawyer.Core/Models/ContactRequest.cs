using System;

namespace Lawyer.Core.Models
{
    public class ContactRequest : BaseEntity<Guid>
    {
        public string Name { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "submitted";
    }
}
