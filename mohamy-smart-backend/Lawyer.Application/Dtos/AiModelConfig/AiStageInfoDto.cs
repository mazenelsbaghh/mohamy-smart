namespace Lawyer.Application.Dtos.AiModelConfig
{
    public record AiStageInfoDto(
        int StepType,
        string StepTypeName,
        string DisplayName,
        string Category,
        int CategoryOrder
    );
}
