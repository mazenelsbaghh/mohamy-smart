using System;

namespace Lawyer.Application.DTOs.Session
{
    public class SessionRollDto
    {
        public Guid Id { get; set; }
        public DateTimeOffset SessionDate { get; set; }
        public string CaseNumber { get; set; } = string.Empty;
        public string CourtName { get; set; } = string.Empty;
        public string PlaintiffName { get; set; } = string.Empty;
        public string DefendantName { get; set; } = string.Empty;
        public string PreviousDecision { get; set; } = string.Empty;
        public string AssignedLawyerName { get; set; } = string.Empty;
    }
}
