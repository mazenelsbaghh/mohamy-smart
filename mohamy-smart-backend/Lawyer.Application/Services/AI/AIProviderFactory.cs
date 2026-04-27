using Lawyer.Application.Common.Interface;
using Lawyer.Application.IServices.AI;
using Lawyer.Core.Enum;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.Services.AI
{
    public class AIProviderFactory : IAIProviderFactory
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<AIProviderFactory> _logger;
        private readonly IApplicationDbContext _db;
        private readonly IMemoryCache _cache;
        private readonly Dictionary<string, IAIProvider> _providers;
        private const string FallbackModel = "gemini-3-flash-preview";
        private readonly string _defaultModel;
        private readonly IAIProvider _fallbackProvider;

        public AIProviderFactory(
            IConfiguration configuration,
            ILogger<AIProviderFactory> _logger,
            IApplicationDbContext db,
            IMemoryCache cache,
            GeminiProvider geminiProvider,
            OpenAIProvider openAIProvider)
        {
            this._logger = _logger;
            _configuration = configuration;
            this._logger = _logger;
            this._db = db;
            this._cache = cache;
            _defaultModel = configuration["Gemini:Model"] ?? FallbackModel;

            _providers = new Dictionary<string, IAIProvider>(StringComparer.OrdinalIgnoreCase)
            {
                { "Gemini", geminiProvider },
                { "Google", geminiProvider },
                { "OpenAI", openAIProvider }
            };
            _fallbackProvider = new FallbackAIProvider(_providers, this._logger);
        }

        public IAIProvider GetProvider()
        {
            return _fallbackProvider;
        }

        public IAIProvider GetProvider(string providerName)
        {
            if (string.IsNullOrWhiteSpace(providerName))
            {
                _logger.LogWarning("Provider name is empty, defaulting to Gemini");
                providerName = "Gemini";
            }

            if (_providers.TryGetValue(providerName, out var provider))
            {
                _logger.LogInformation("Using AI provider: {Provider}", provider.ProviderName);
                return provider;
            }

            _logger.LogWarning("Unknown provider '{Provider}', defaulting to Gemini", providerName);
            return _providers["Gemini"];
        }

        public IEnumerable<string> GetAvailableProviders()
        {
            return _providers.Keys.Where(p => !string.Equals(p, "Google", StringComparison.OrdinalIgnoreCase));
        }

        public async Task<string> GetModelForStepAsync(AiStepType stepType)
        {
            var cacheKey = $"AiModelConfig_{(int)stepType}";

            if (_cache.TryGetValue(cacheKey, out string? cachedModel))
            {
                return cachedModel!;
            }

            try
            {
                var config = await _db.AiStageModelConfigs
                    .Where(c => c.StepType == stepType)
                    .FirstOrDefaultAsync();

                var model = config?.ModelIdentifier ?? _defaultModel;

                _cache.Set(cacheKey, model, new MemoryCacheEntryOptions
                {
                    SlidingExpiration = TimeSpan.FromMinutes(5)
                });

                return model;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to resolve model for step {StepType}, using default", stepType);
                return _defaultModel;
            }
        }

        private sealed class FallbackAIProvider : IAIProvider
        {
            private readonly IReadOnlyDictionary<string, IAIProvider> _providers;
            private readonly ILogger _logger;

            public FallbackAIProvider(IReadOnlyDictionary<string, IAIProvider> providers, ILogger logger)
            {
                _providers = providers;
                _logger = logger;
            }

            public string ProviderName => "Fallback";

            public async Task<Result<AIResponse>> SendChatCompletionAsync(
                string systemPrompt,
                string userPrompt,
                AIRequestOptions options,
                CancellationToken cancellationToken)
            {
                var orderedProviders = new[] { "Gemini", "OpenAI" };
                Result<AIResponse>? lastResult = null;

                foreach (var providerName in orderedProviders)
                {
                    if (!_providers.TryGetValue(providerName, out var provider))
                        continue;

                    var result = await provider.SendChatCompletionAsync(systemPrompt, userPrompt, options, cancellationToken);
                    if (result.Succeeded)
                        return result;

                    lastResult = result;
                    if (!IsTransient(result.StatusCode))
                        break;

                    _logger.LogWarning("AI provider {Provider} failed transiently ({StatusCode}); trying fallback provider.", provider.ProviderName, result.StatusCode);
                }

                return lastResult ?? Result<AIResponse>.Error(HttpStatusCode.BadGateway, "No AI provider is available");
            }

            private static bool IsTransient(HttpStatusCode statusCode) =>
                statusCode == HttpStatusCode.TooManyRequests ||
                statusCode == HttpStatusCode.BadGateway ||
                statusCode == HttpStatusCode.ServiceUnavailable ||
                statusCode == HttpStatusCode.GatewayTimeout ||
                statusCode == HttpStatusCode.InternalServerError;
        }
    }
}
