using Lawyer.Core.Enum;

namespace Lawyer.Application.Dtos.AiJobs
{
    public record SubmitAiJobDto(
        AiStepType StepType,
        string? InputJson,
        string? RunId,
        string? WorkflowType,
        int? StepNumber,
        AiRepeatIntent? RepeatIntent = null,
        DateTime? ConfirmationAcceptedAt = null
    );
}
