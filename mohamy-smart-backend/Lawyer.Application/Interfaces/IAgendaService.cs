using Lawyer.Core.Models.Agenda;
using Lawyer.Core.Exceptions;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Lawyer.Application.DTOs.Session;

namespace Lawyer.Application.Interfaces
{
    public interface IAgendaService
    {
        Task<Result<AgendaItem>> CreateAgendaItemAsync(AgendaItem item);
        Task<Result<IEnumerable<AgendaItem>>> GetAgendaItemsByCaseIdAsync(Guid caseId);
        Task<Result<IEnumerable<AgendaItem>>> GetAgendaItemsByLawyerIdAsync(Guid lawyerId);
        Task<Result<IEnumerable<SessionRollDto>>> GetAgendaRollAsync(DateTime? date, Guid? lawyerId);
    }
}
