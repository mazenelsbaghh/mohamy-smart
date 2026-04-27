using System;

namespace Lawyer.Application.DTOs.POA
{
    public class PowerOfAttorneyDto
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public string Number { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string IssuingAuthority { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        public bool IsCanceled { get; set; }
        public DateTime? CancellationDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
