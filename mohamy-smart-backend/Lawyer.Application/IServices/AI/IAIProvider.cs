using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices.AI
{
    /// <summary>
    /// Strategy interface for AI providers
    /// </summary>
    public interface IAIProvider
    {
        /// <summary>
        /// Gets the provider name (e.g., "Gemini")
        /// </summary>
        string ProviderName { get; }

        /// <summary>
        /// Sends a chat completion request to the AI provider
        /// </summary>
        /// <param name="systemPrompt">The system prompt that sets the AI's behavior</param>
        /// <param name="userPrompt">The user's message/prompt</param>
        /// <param name="options">Request options like temperature and max tokens</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The AI's response content</returns>
        Task<Result<AIResponse>> SendChatCompletionAsync(
            string systemPrompt,
            string userPrompt,
            AIRequestOptions options,
            CancellationToken cancellationToken);
    }

    public record AIUsageMetadata(int InputTokens, int OutputTokens, int TotalTokens);

    public record AIResponse(string Content, AIUsageMetadata? Usage);

    /// <summary>
    /// Options for AI chat completion requests
    /// </summary>
    public record AIRequestOptions
    {
        public float Temperature { get; init; } = 0.1f;
        public int MaxTokens { get; init; } = 4000;
        public string? Model { get; init; } // Optional: override default model

        public static AIRequestOptions Default => new();

        public static AIRequestOptions ForAnalysis => new()
        {
            Temperature = 0.1f,
            MaxTokens = 8192
        };

        public static AIRequestOptions ForDefenses => new()
        {
            Temperature = 0.1f,
            MaxTokens = 8192
        };

        public static AIRequestOptions ForDefenseAnalysis => new()
        {
            Temperature = 0.1f,
            MaxTokens = 8192
        };

        public static AIRequestOptions ForFinalRequirements => new()
        {
            Temperature = 0.1f,
            MaxTokens = 8192
        };

        /// <summary>
        /// Optimized for legal contract drafting — higher token limit for long-form Arabic legal text,
        /// low temperature for consistent and formal output.
        /// </summary>
        public static AIRequestOptions ForContractDraft => new()
        {
            Temperature = 0.05f,
            MaxTokens = 16000
        };
    }
}
