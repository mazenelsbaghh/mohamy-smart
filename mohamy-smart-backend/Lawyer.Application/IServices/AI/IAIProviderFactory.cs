namespace Lawyer.Application.IServices.AI
{
    /// <summary>
    /// Factory interface for resolving the correct AI provider based on configuration
    /// </summary>
    public interface IAIProviderFactory
    {
        /// <summary>
        /// Gets the currently configured AI provider based on admin settings
        /// </summary>
        /// <returns>The active AI provider</returns>
        IAIProvider GetProvider();

        /// <summary>
        /// Gets a specific AI provider by name
        /// </summary>
        /// <param name="providerName">Provider name: "Gemini"</param>
        /// <returns>The requested AI provider</returns>
        IAIProvider GetProvider(string providerName);

        /// <summary>
        /// Gets all available provider names
        /// </summary>
        IEnumerable<string> GetAvailableProviders();

        /// <summary>
        /// Gets the configured model identifier for a specific AI step type
        /// </summary>
        Task<string> GetModelForStepAsync(Lawyer.Core.Enum.AiStepType stepType);
    }
}
