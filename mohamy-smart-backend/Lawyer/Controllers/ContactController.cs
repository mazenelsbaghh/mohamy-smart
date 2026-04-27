using Lawyer.Application.Dtos.Contact;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [EnableRateLimiting("contact")]
    public class ContactController : AppControllerBase
    {
        private readonly IContactService _contactService;

        public ContactController(IContactService contactService)
        {
            _contactService = contactService;
        }

        /// <summary>
        /// Public endpoint: submit a contact request from the landing page.
        /// </summary>
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitContactRequest([FromBody] SubmitContactRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _contactService.SubmitContactRequestAsync(dto, cancellationToken);
            return CreateResponse(result);
        }

        /// <summary>
        /// Admin-only: list contact requests, optionally filtered by status (New, Read, Replied).
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetContactRequests([FromQuery] string? status, CancellationToken cancellationToken)
        {
            var result = await _contactService.GetContactRequestsAsync(status, cancellationToken);
            return CreateResponse(result);
        }

        /// <summary>
        /// Admin-only: update the status of a contact request.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateContactStatus(Guid id, [FromBody] UpdateContactStatusDto dto, CancellationToken cancellationToken)
        {
            var result = await _contactService.UpdateContactStatusAsync(id, dto.Status, cancellationToken);
            return CreateResponse(result);
        }
    }
}
