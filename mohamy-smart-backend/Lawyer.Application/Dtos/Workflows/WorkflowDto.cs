using System;
using System.Collections.Generic;

namespace Lawyer.Application.Dtos.Workflows
{
    public class WorkflowDto<TStepOutput>
    {
        public int Id { get; set; }
        public Guid CaseId { get; set; }
        public string LawyerId { get; set; } = string.Empty;
        public int CurrentStep { get; set; }
        public string Status { get; set; } = string.Empty;
        public Dictionary<int, TStepOutput> Outputs { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public string? ExecuteTitleType { get; set; }
        public string? RunId { get; set; }
        public int CurrentAccessibleStep { get; set; }
        public int LastCompletedStep { get; set; }
        public object? ActiveRequest { get; set; }
        public object? StageConflicts { get; set; }
    }
}
