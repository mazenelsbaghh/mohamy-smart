using Lawyer.Application.IServices.AI;
using Lawyer.Core.Exceptions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Lawyer.Application.Services.AI
{
    public class OpenAIProvider : IAIProvider
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<OpenAIProvider> _logger;
        private readonly string? _apiKey;
        private readonly string _defaultModel;

        public string ProviderName => "OpenAI";

        public OpenAIProvider(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<OpenAIProvider> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _apiKey = configuration["OpenAI:ApiKey"];
            _defaultModel = configuration["OpenAI:Model"] ?? "gpt-4.1-mini";
        }

        public async Task<Result<AIResponse>> SendChatCompletionAsync(
            string systemPrompt,
            string userPrompt,
            AIRequestOptions options,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(_apiKey) || _apiKey.Contains("YOUR_", StringComparison.OrdinalIgnoreCase))
                return Result<AIResponse>.Error(HttpStatusCode.ServiceUnavailable, "OpenAI API key is not configured");

            try
            {
                var client = _httpClientFactory.CreateClient("OpenAI");
                using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

                var body = new
                {
                    model = options.Model?.StartsWith("gemini-", StringComparison.OrdinalIgnoreCase) == true
                        ? _defaultModel
                        : options.Model ?? _defaultModel,
                    temperature = options.Temperature,
                    max_tokens = options.MaxTokens,
                    messages = new[]
                    {
                        new { role = "system", content = systemPrompt },
                        new { role = "user", content = userPrompt }
                    }
                };

                request.Content = new StringContent(JsonSerializer.Serialize(body, Common.JsonOptions.Serialize), Encoding.UTF8, "application/json");
                using var response = await client.SendAsync(request, cancellationToken);
                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("OpenAI API error: {StatusCode} - {Error}", response.StatusCode, responseContent);
                    return Result<AIResponse>.Error(response.StatusCode, $"OpenAI API error: {response.StatusCode}");
                }

                using var doc = JsonDocument.Parse(responseContent);
                var content = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(content))
                    return Result<AIResponse>.Error(HttpStatusCode.BadGateway, "OpenAI returned empty response");

                AIUsageMetadata? usage = null;
                if (doc.RootElement.TryGetProperty("usage", out var usageElement))
                {
                    var inputTokens = usageElement.TryGetProperty("prompt_tokens", out var promptTokens) ? promptTokens.GetInt32() : 0;
                    var outputTokens = usageElement.TryGetProperty("completion_tokens", out var completionTokens) ? completionTokens.GetInt32() : 0;
                    var totalTokens = usageElement.TryGetProperty("total_tokens", out var total) ? total.GetInt32() : 0;
                    usage = new AIUsageMetadata(inputTokens, outputTokens, totalTokens);
                }

                return Result<AIResponse>.Success(new AIResponse(content, usage));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenAI API");
                return Result<AIResponse>.Error(HttpStatusCode.InternalServerError, "An error occurred while calling the fallback AI provider.");
            }
        }
    }
}
