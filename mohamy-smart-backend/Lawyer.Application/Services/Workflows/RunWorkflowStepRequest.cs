using System;

namespace Lawyer.Application.Services.Workflows
{
    public record RunWorkflowStepRequest
    {
        public Guid CaseId { get; init; }
        public int? WorkflowId { get; init; }
        public int StepNumber { get; init; }
        public string? Input { get; init; }
    }
}
