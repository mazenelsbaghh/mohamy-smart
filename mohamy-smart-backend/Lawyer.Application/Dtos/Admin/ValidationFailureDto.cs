using System;

namespace Lawyer.Application.Dtos.Admin
{
    public record ValidationFailureDto
    {
        public Guid Id { get; init; }
        public string WorkflowType { get; init; } = string.Empty;
        public int StepType { get; init; }
        public DateTime OccurredAt { get; init; }
        public string ErrorSummary { get; init; } = string.Empty;
        public Guid? CaseId { get; init; }
        public string? LawyerId { get; init; }
    }
}
