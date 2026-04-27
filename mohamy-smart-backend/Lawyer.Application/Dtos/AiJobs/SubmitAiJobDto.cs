using Lawyer.Core.Enum;

namespace Lawyer.Application.Dtos.AiJobs
{
    public record SubmitAiJobDto(
        AiStepType StepType,
        string? InputJson
    );
}
