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
        private const string FallbackModel = "gemini-3.5-flash";
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
            private const int MaxRetries = 3;

            public FallbackAIProvider(IReadOnlyDictionary<string, IAIProvider> providers, ILogger logger)
            {
                _providers = providers;
                _logger = logger;
            }

            public string ProviderName => "Gemini (with retry)";

            public async Task<Result<AIResponse>> SendChatCompletionAsync(
                string systemPrompt,
                string userPrompt,
                AIRequestOptions options,
                CancellationToken cancellationToken)
            {
                if (!_providers.TryGetValue("Gemini", out var provider))
                    return Result<AIResponse>.Error(HttpStatusCode.BadGateway, "Gemini provider is not configured");

                Result<AIResponse>? lastResult = null;

                for (var attempt = 1; attempt <= MaxRetries; attempt++)
                {
                    var result = await provider.SendChatCompletionAsync(systemPrompt, userPrompt, options, cancellationToken);
                    if (result.Succeeded)
                        return result;

                    lastResult = result;

                    if (!IsTransient(result.StatusCode))
                    {
                        _logger.LogWarning("AI provider Gemini failed with non-transient error ({StatusCode}); will not retry.", result.StatusCode);
                        break;
                    }

                    if (attempt < MaxRetries)
                    {
                        var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt)); // 2s, 4s, 8s
                        _logger.LogWarning(
                            "AI provider Gemini failed transiently ({StatusCode}); retrying in {Delay}s (attempt {Attempt}/{MaxRetries}).",
                            result.StatusCode, delay.TotalSeconds, attempt, MaxRetries);
                        await Task.Delay(delay, cancellationToken);
                    }
                    else
                    {
                        _logger.LogError(
                            "AI provider Gemini failed after {MaxRetries} attempts ({StatusCode}).",
                            MaxRetries, result.StatusCode);
                    }
                }

                return lastResult ?? Result<AIResponse>.Error(HttpStatusCode.BadGateway, "Gemini provider is not available");
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
