using System;

namespace Lawyer.Application.Dtos.LegalWarning
{
    public class LegalWarningWorkflowDto
    {
        public int Id { get; set; }
        public Guid CaseId { get; set; }
        public string LawyerId { get; set; } = string.Empty;
        public int CurrentStep { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Step1Output { get; set; }
        public string? Step2Output { get; set; }
        public string? Step3Output { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? RunId { get; set; }
        public int CurrentAccessibleStep { get; set; }
        public int LastCompletedStep { get; set; }
        public object? ActiveRequests { get; set; }
        public object? StageConflicts { get; set; }
        public bool IsReadOnly { get; set; }
        public bool CanStart { get; set; }
        public bool CanResumeCurrent { get; set; }
        public bool CanStartNew { get; set; }
        public DateTime? CurrentRunCreatedAt { get; set; }
    }
}
