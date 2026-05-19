namespace Lawyer.Application.Dtos.AiModelConfig
{
    public record AiModelOptionDto(
        string Identifier,
        string DisplayName,
        string Description,
        string? DocumentationUrl = null,
        string? PricingNotes = null
    );
}
