using Lawyer.Core.Enum;

namespace Lawyer.Application.Dtos.AiModelConfig
{
    public record AiStageModelConfigDto(
        int StepType,
        string StepTypeName,
        string DisplayName,
        string Category,
        string ModelIdentifier,
        string ModelDisplayName,
        DateTime UpdatedAt,
        string? UpdatedBy
    );
}
