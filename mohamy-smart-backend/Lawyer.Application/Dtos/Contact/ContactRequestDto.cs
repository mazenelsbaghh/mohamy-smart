using System;

namespace Lawyer.Application.Dtos.Contact
{
    public class SubmitContactRequestDto
    {
        public string Name { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Message { get; set; } = null!;
    }

    public class ContactRequestResponseDto
    {
        public Guid ContactRequestId { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = null!;
    }

    /// <summary>
    /// DTO returned to admin when listing contact requests.
    /// </summary>
    public class AdminContactRequestDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = null!;
    }

    /// <summary>
    /// DTO for admin updating a contact request status.
    /// </summary>
    public class UpdateContactStatusDto
    {
        public string Status { get; set; } = null!;
    }
}
