using Lawyer.Core.Enum;

namespace Lawyer.Application.Dtos.AiJobs
{
    public record AiJobStatusDto(
        Guid Id,
        Guid CaseId,
        AiStepType StepType,
        AiJobStatus Status,
        string? ResultJson,
        string? ErrorMessage,
        DateTime CreatedAt,
        DateTime? CompletedAt
    );
}
