using Lawyer.Application.Common;
using Lawyer.Application.Dtos.Agenda;
using Lawyer.Application.IServices;
using Lawyer.Controllers.Base;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models.Agenda;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class AgendaController : AppControllerBase
    {
        private readonly IAgendaService _agendaService;
        private readonly ICaseAccessValidator _caseAccessValidator;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IValidator<AgendaItemDto> _validator;

        public AgendaController(
            IAgendaService agendaService,
            ICaseAccessValidator caseAccessValidator,
            IUnitOfWork unitOfWork,
            IValidator<AgendaItemDto> validator)
        {
            _agendaService = agendaService;
            _caseAccessValidator = caseAccessValidator;
            _unitOfWork = unitOfWork;
            _validator = validator;
        }

        [HttpGet("case/{caseId}")]
        public async Task<IActionResult> GetAgendaItems(Guid caseId, CancellationToken cancellationToken)
        {
            var accessResult = await ValidateCaseAccessAsync(caseId, cancellationToken);
            if (accessResult is not null)
                return accessResult;

            var result = await _agendaService.GetAgendaItemsByCaseIdAsync(caseId);
            if (!result.Succeeded)
                return CreateResponse(result);

            return CreateResponse(result);
        }

        [HttpGet("lawyer/{lawyerId}")]
        public async Task<IActionResult> GetAgendaItemsByLawyer(Guid lawyerId, CancellationToken cancellationToken)
        {
            var requestedLawyerId = await ResolveRequestedLawyerIdAsync(lawyerId, cancellationToken);
            if (!requestedLawyerId.Succeeded)
                return StatusCode((int)requestedLawyerId.StatusCode, requestedLawyerId);

            var result = await _agendaService.GetAgendaItemsByLawyerIdAsync(requestedLawyerId.Data);
            if (!result.Succeeded)
                return CreateResponse(result);

            return CreateResponse(result);
        }

        [HttpGet("agenda-roll")]
        public async Task<IActionResult> GetAgendaRoll([FromQuery] DateTime? date, [FromQuery] Guid? lawyerId, CancellationToken cancellationToken)
        {
            Guid? requestedLawyerId = null;
            if (lawyerId.HasValue)
            {
                var resolveResult = await ResolveRequestedLawyerIdAsync(lawyerId.Value, cancellationToken);
                if (!resolveResult.Succeeded)
                    return StatusCode((int)resolveResult.StatusCode, resolveResult);
                requestedLawyerId = resolveResult.Data;
            }
            else if (User.IsInRole("Lawyer"))
            {
                var currentLawyerResult = await ResolveCurrentLawyerIdAsync(cancellationToken);
                if (!currentLawyerResult.Succeeded)
                    return StatusCode((int)currentLawyerResult.StatusCode, currentLawyerResult);
                requestedLawyerId = currentLawyerResult.Data;
            }

            var result = await _agendaService.GetAgendaRollAsync(date, requestedLawyerId);
            if (!result.Succeeded)
                return CreateResponse(result);

            return CreateResponse(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAgendaItem([FromBody] AgendaItemDto dto, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage).FirstOrDefault());

            var accessResult = await ValidateCaseAccessAsync(dto.CaseId, cancellationToken);
            if (accessResult is not null)
                return accessResult;

            AgendaItem item;

            if (dto.Type == "Session")
            {
                item = new SessionAgendaItem
                {
                    CaseId = dto.CaseId,
                    Title = dto.Title,
                    Date = dto.Date,
                    EndDate = dto.EndDate,
                    Status = dto.Status,
                    SessionType = dto.SessionType ?? string.Empty,
                    CourtName = dto.CourtName ?? string.Empty,
                    PreviousSessionId = dto.PreviousSessionId,
                    PostponementReason = dto.PostponementReason,
                    PreviousDecision = dto.PreviousDecision,
                    AssignedLawyerId = dto.AssignedLawyerId
                };
            }
            else if (dto.Type == "Action")
            {
                item = new ActionAgendaItem
                {
                    CaseId = dto.CaseId,
                    Title = dto.Title,
                    Date = dto.Date,
                    EndDate = dto.EndDate,
                    Status = dto.Status,
                    ActionType = Enum.Parse<ActionType>(dto.ActionType ?? "Inspection", true),
                    ExecutionDetails = dto.ExecutionDetails ?? string.Empty,
                    Location = dto.Location
                };
            }
            else
            {
                return BadRequest("Invalid Agenda Type");
            }

            var result = await _agendaService.CreateAgendaItemAsync(item);

            if (!result.Succeeded)
                return CreateResponse(result);
                
            return CreatedAtAction(nameof(GetAgendaItems), new { caseId = item.CaseId }, result.Data);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAgendaItem(Guid id, [FromBody] AgendaItemDto dto, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(dto, cancellationToken);
            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage).FirstOrDefault());

            var accessResult = await ValidateCaseAccessAsync(dto.CaseId, cancellationToken);
            if (accessResult is not null)
                return accessResult;

            AgendaItem item;
            if (dto.Type == "Session")
            {
                item = new SessionAgendaItem
                {
                    CaseId = dto.CaseId,
                    Title = dto.Title,
                    Date = dto.Date,
                    EndDate = dto.EndDate,
                    Status = dto.Status,
                    SessionType = dto.SessionType ?? string.Empty,
                    CourtName = dto.CourtName ?? string.Empty,
                    PreviousSessionId = dto.PreviousSessionId,
                    PostponementReason = dto.PostponementReason,
                    PreviousDecision = dto.PreviousDecision,
                    AssignedLawyerId = dto.AssignedLawyerId
                };
            }
            else if (dto.Type == "Action")
            {
                item = new ActionAgendaItem
                {
                    CaseId = dto.CaseId,
                    Title = dto.Title,
                    Date = dto.Date,
                    EndDate = dto.EndDate,
                    Status = dto.Status,
                    ActionType = Enum.Parse<ActionType>(dto.ActionType ?? "Inspection", true),
                    ExecutionDetails = dto.ExecutionDetails ?? string.Empty,
                    Location = dto.Location
                };
            }
            else
            {
                return BadRequest("Invalid Agenda Type");
            }

            var result = await _agendaService.UpdateAgendaItemAsync(id, item);
            if (!result.Succeeded)
                return CreateResponse(result);

            return CreateResponse(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAgendaItem(Guid id, [FromQuery] Guid caseId, CancellationToken cancellationToken)
        {
            var accessResult = await ValidateCaseAccessAsync(caseId, cancellationToken);
            if (accessResult is not null)
                return accessResult;

            var result = await _agendaService.DeleteAgendaItemAsync(id, caseId);
            if (!result.Succeeded)
                return CreateResponse(result);

            return CreateResponse(result);
        }

        private async Task<IActionResult?> ValidateCaseAccessAsync(Guid caseId, CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var accessResult = await _caseAccessValidator.ValidateAsync(caseId, userId, false, cancellationToken);
            if (accessResult.Succeeded)
                return null;

            return StatusCode((int)accessResult.StatusCode, accessResult);
        }

        private async Task<Lawyer.Core.Exceptions.Result<Guid>> ResolveCurrentLawyerIdAsync(CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userId, out var parsedUserId) || parsedUserId == Guid.Empty)
                return Lawyer.Core.Exceptions.Result<Guid>.Error(System.Net.HttpStatusCode.Unauthorized, "User required");

            var lawyer = await _unitOfWork.Repository<Lawyer.Core.Models.Lawyer>()
                .FirstOrDefaultAsync(x => x.ApplicationUserId == parsedUserId, cancellationToken);

            if (lawyer == null)
                return Lawyer.Core.Exceptions.Result<Guid>.Error(System.Net.HttpStatusCode.NotFound, "Lawyer profile not found");

            return Lawyer.Core.Exceptions.Result<Guid>.Success(lawyer.Id);
        }

        private async Task<Lawyer.Core.Exceptions.Result<Guid>> ResolveRequestedLawyerIdAsync(Guid lawyerId, CancellationToken cancellationToken)
        {
            if (User.IsInRole("Admin"))
                return Lawyer.Core.Exceptions.Result<Guid>.Success(lawyerId);

            if (!User.IsInRole("Lawyer"))
                return Lawyer.Core.Exceptions.Result<Guid>.Error(System.Net.HttpStatusCode.Unauthorized, "Unauthorized");

            var currentLawyerResult = await ResolveCurrentLawyerIdAsync(cancellationToken);
            if (!currentLawyerResult.Succeeded)
                return currentLawyerResult;

            if (currentLawyerResult.Data != lawyerId)
                return Lawyer.Core.Exceptions.Result<Guid>.Error(System.Net.HttpStatusCode.Forbidden, "ليس لديك صلاحية للوصول إلى جدول جلسات محامٍ آخر");

            return currentLawyerResult;
        }
    }
}
