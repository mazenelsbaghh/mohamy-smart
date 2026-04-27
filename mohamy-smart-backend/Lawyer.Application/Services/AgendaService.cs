using Lawyer.Application.Common.Interface;
using Lawyer.Application.Interfaces;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models.Agenda;
using Microsoft.EntityFrameworkCore;
using System;
using Lawyer.Application.DTOs.Session;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class AgendaService : IAgendaService
    {
        private readonly IApplicationDbContext _context;

        public AgendaService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<AgendaItem>> CreateAgendaItemAsync(AgendaItem item)
        {
            try
            {
                item.Created = DateTime.UtcNow;
                _context.AgendaItems.Add(item);
                await _context.SaveChangesAsync();
                
                return Result<AgendaItem>.Success(item);
            }
            catch (Exception ex)
            {
                return Result<AgendaItem>.Error(System.Net.HttpStatusCode.InternalServerError, "An error occurred while creating the agenda item.");
            }
        }

        public async Task<Result<IEnumerable<AgendaItem>>> GetAgendaItemsByCaseIdAsync(Guid caseId)
        {
            try
            {
                var items = await _context.AgendaItems
                    .Where(a => a.CaseId == caseId)
                    .OrderBy(a => a.Date)
                    .ToListAsync();

                return Result<IEnumerable<AgendaItem>>.Success(items);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<AgendaItem>>.Error(System.Net.HttpStatusCode.InternalServerError, "An error occurred while fetching agenda items.");
            }
        }

        public async Task<Result<IEnumerable<AgendaItem>>> GetAgendaItemsByLawyerIdAsync(Guid lawyerId)
        {
            try
            {
                var items = await _context.AgendaItems
                    .Where(a => a.Case.LawyerId == lawyerId)
                    .OrderBy(a => a.Date)
                    .ToListAsync();

                return Result<IEnumerable<AgendaItem>>.Success(items);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<AgendaItem>>.Error(System.Net.HttpStatusCode.InternalServerError, "An error occurred while fetching agenda items.");
            }
        }

        public async Task<Result<IEnumerable<SessionRollDto>>> GetAgendaRollAsync(DateTime? date, Guid? lawyerId)
        {
            try
            {
                var query = _context.AgendaItems
                    .OfType<SessionAgendaItem>()
                    .Include(a => a.Case)
                    .ThenInclude(c => c.Lawyer)
                    .Include(a => a.AssignedLawyer)
                    .AsQueryable();

                if (date.HasValue)
                {
                    query = query.Where(a => a.Date.Date == date.Value.Date);
                }

                if (lawyerId.HasValue)
                {
                    query = query.Where(a => a.AssignedLawyerId == lawyerId.Value || a.Case.LawyerId == lawyerId.Value);
                }

                var sessions = await query.Select(a => new SessionRollDto
                {
                    Id = a.Id,
                    SessionDate = a.Date,
                    CaseNumber = a.Case.Number,
                    CourtName = a.CourtName,
                    PlaintiffName = a.Case.ClientName,
                    DefendantName = a.Case.ApponentName,
                    PreviousDecision = a.PreviousDecision ?? "",
                    AssignedLawyerName = a.AssignedLawyer != null 
                        ? a.AssignedLawyer.FullName 
                        : (a.Case.Lawyer != null && a.Case.Lawyer.ApplicationUser != null 
                            ? a.Case.Lawyer.ApplicationUser.FullName 
                            : "غير محدد")
                }).ToListAsync();

                return Result<IEnumerable<SessionRollDto>>.Success(sessions);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<SessionRollDto>>.Error(System.Net.HttpStatusCode.InternalServerError, "An error occurred while fetching the agenda roll.");
            }
        }
    }
}
