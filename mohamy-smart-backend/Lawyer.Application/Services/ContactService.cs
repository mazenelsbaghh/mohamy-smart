using Lawyer.Application.Dtos.Contact;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class ContactService : IContactService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ContactService> _logger;

        private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "New", "Read", "Replied"
        };

        public ContactService(IUnitOfWork unitOfWork, ILogger<ContactService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<ContactRequestResponseDto>> SubmitContactRequestAsync(SubmitContactRequestDto dto, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Phone) || string.IsNullOrWhiteSpace(dto.Message))
            {
                return Result<ContactRequestResponseDto>.Error(HttpStatusCode.BadRequest, "الاسم ورقم الهاتف والرسالة حقول مطلوبة");
            }

            var contactRequest = new ContactRequest
            {
                Name = dto.Name,
                Phone = dto.Phone,
                Message = dto.Message,
                SubmittedAt = DateTime.UtcNow,
                Status = "New",
            };

            await _unitOfWork.Repository<ContactRequest>()!.AddAsync(contactRequest);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var response = new ContactRequestResponseDto
            {
                ContactRequestId = contactRequest.Id,
                SubmittedAt = contactRequest.SubmittedAt,
                Status = contactRequest.Status,
            };

            return Result<ContactRequestResponseDto>.Created(response);
        }

        public async Task<Result<List<AdminContactRequestDto>>> GetContactRequestsAsync(string? status, CancellationToken cancellationToken)
        {
            var query = _unitOfWork.Repository<ContactRequest>()
                .AsQueryable()
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(c => c.Status == status);
            }

            var contacts = await query
                .OrderByDescending(c => c.SubmittedAt)
                .ToListAsync(cancellationToken);

            var result = contacts.Select(c => new AdminContactRequestDto
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Message = c.Message,
                SubmittedAt = c.SubmittedAt,
                Status = c.Status,
            }).ToList();

            return Result<List<AdminContactRequestDto>>.Success(result);
        }

        public async Task<Result<AdminContactRequestDto>> UpdateContactStatusAsync(Guid id, string status, CancellationToken cancellationToken)
        {
            if (!ValidStatuses.Contains(status))
            {
                return Result<AdminContactRequestDto>.Error(HttpStatusCode.BadRequest, $"Invalid status. Allowed: {string.Join(", ", ValidStatuses)}");
            }

            var contactRequest = await _unitOfWork.Repository<ContactRequest>()
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            if (contactRequest == null)
            {
                return Result<AdminContactRequestDto>.Error(HttpStatusCode.NotFound, "Contact request not found");
            }

            contactRequest.Status = status;
	            await _unitOfWork.Repository<ContactRequest>().Update(contactRequest);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Contact request {Id} status updated to {Status}", id, status);

            return Result<AdminContactRequestDto>.Success(new AdminContactRequestDto
            {
                Id = contactRequest.Id,
                Name = contactRequest.Name,
                Phone = contactRequest.Phone,
                Message = contactRequest.Message,
                SubmittedAt = contactRequest.SubmittedAt,
                Status = contactRequest.Status,
            });
        }
    }
}
