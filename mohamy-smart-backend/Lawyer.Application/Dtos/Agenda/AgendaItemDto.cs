using System;
using Lawyer.Core.Models.Agenda;

namespace Lawyer.Application.Dtos.Agenda
{
    public class AgendaItemDto
    {
        public Guid CaseId { get; set; }
        public required string Title { get; set; }
        public DateTimeOffset Date { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public required string Type { get; set; }
        public AgendaStatus Status { get; set; }

        public string? SessionType { get; set; }
        public string? CourtName { get; set; }
        public Guid? PreviousSessionId { get; set; }
        public string? PostponementReason { get; set; }
        public string? PreviousDecision { get; set; }
        public Guid? AssignedLawyerId { get; set; }

        public string? ActionType { get; set; }
        public string? ExecutionDetails { get; set; }
        public string? Location { get; set; }
    }
}
