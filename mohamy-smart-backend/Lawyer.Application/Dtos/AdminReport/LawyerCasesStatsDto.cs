using System;

namespace Lawyer.Application.Dtos.AdminReport
{
    public class LawyerCasesStatsDto
    {
        public Guid LawyerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public int CasesCount { get; set; }
        public int CompletedStepsCount { get; set; }
        public int WorkflowVersionsCount { get; set; }
    }
}
