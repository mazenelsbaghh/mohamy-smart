namespace Lawyer.Core.Enum
{
    public enum AiModelType
    {
        Pro = 0,
        Flash = 1,
        FlashLite = 2,
    }

    public static class AiModelTypeExtensions
    {
        public static string ToModelIdentifier(this AiModelType modelType) => modelType switch
        {
            AiModelType.Pro => "gemini-3.1-pro-preview",
            AiModelType.Flash => "gemini-3-flash-preview",
            AiModelType.FlashLite => "gemini-3.1-flash-lite-preview",
            _ => "gemini-3.1-pro-preview"
        };

        public static string ToDisplayName(this AiModelType modelType) => modelType switch
        {
            AiModelType.Pro => "Pro 3.1",
            AiModelType.Flash => "Flash 3",
            AiModelType.FlashLite => "Flash Lite 3.1",
            _ => "Pro 3.1"
        };

        public static string ToDescription(this AiModelType modelType) => modelType switch
        {
            AiModelType.Pro => "أعلى جودة وأعلى تكلفة",
            AiModelType.Flash => "متوازن بين الجودة والسرعة",
            AiModelType.FlashLite => "أسرع وأقل تكلفة",
            _ => ""
        };

        public static readonly string[] ValidModelIdentifiers =
        [
            "gemini-3.1-pro-preview",
            "gemini-3-flash-preview",
            "gemini-3.1-flash-lite-preview"
        ];

        public static string ToModelDisplayName(string modelIdentifier) => modelIdentifier switch
        {
            "gemini-3.1-pro-preview" => "Pro 3.1",
            "gemini-3-flash-preview" => "Flash 3",
            "gemini-3.1-flash-lite-preview" => "Flash Lite 3.1",
            _ => modelIdentifier
        };
    }
}
