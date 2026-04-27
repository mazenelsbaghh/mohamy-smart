using Lawyer.Application.Dtos.Contact;
using Lawyer.Core.Exceptions;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface IContactService
    {
        Task<Result<ContactRequestResponseDto>> SubmitContactRequestAsync(SubmitContactRequestDto dto, CancellationToken cancellationToken);

        /// <summary>
        /// List contact requests for admin review, optionally filtered by status.
        /// </summary>
        Task<Result<List<AdminContactRequestDto>>> GetContactRequestsAsync(string? status, CancellationToken cancellationToken);

        /// <summary>
        /// Update a contact request status to New, Read, or Replied.
        /// </summary>
        Task<Result<AdminContactRequestDto>> UpdateContactStatusAsync(System.Guid id, string status, CancellationToken cancellationToken);
    }
}
