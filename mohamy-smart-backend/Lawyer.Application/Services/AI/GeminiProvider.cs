using Lawyer.Application.IServices.AI;
using Lawyer.Core.Exceptions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace Lawyer.Application.Services.AI
{
    public class GeminiProvider : IAIProvider
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<GeminiProvider> _logger;
        private readonly string _apiKey;
        private readonly string _defaultModel;
        private const string ApiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

        private const string LegalContextPrefix =
            "MANDATORY LEGAL CONTEXT:\n" +
            "The current year is 2026. All responses must be grounded in the latest Egyptian legislation and laws in force as of 2026, " +
            "including any recent legislative amendments, newly enacted laws, or executive regulations. " +
            "Never rely on repealed, amended, or superseded legal texts. " +
            "If a legal provision has been recently amended, apply the current amended text only — do not reference the old version. " +
            "CRITICAL: The old Egyptian Labor Law No. 12 of 2003 and its amendments are entirely REPEALED. You MUST exclusively use and cite the completely NEW Egyptian Labor Law No. 14 of 2025 (قانون العمل الجديد رقم 14 لسنة 2025) which became effective on 1/9/2025. " +
            "If citing Article 150 of Labor Law 14 of 2025 regarding amicable settlement, you MUST output the ENTIRE EXACT ARTICLE including the exact text detailing what happens if the settlement FAILS (إذا لم تتم التسوية الودية). Do NOT truncate the article. " +
            "Always cite article numbers and law references with precision.\n" +
            "─────────────────────────────────────────\n";

        public string ProviderName => "Gemini";

        public GeminiProvider(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<GeminiProvider> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _apiKey = configuration["Gemini:ApiKey"]
                ?? throw new InvalidOperationException("Gemini:ApiKey is not configured");
            _defaultModel = configuration["Gemini:Model"] ?? "gemini-1.5-flash";
        }

        public async Task<Result<AIResponse>> SendChatCompletionAsync(
            string systemPrompt,
            string userPrompt,
            AIRequestOptions options,
            CancellationToken cancellationToken)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("Gemini");

                var model = options.Model ?? _defaultModel;
                var endpoint = $"{ApiBaseUrl}/{model}:generateContent?key={_apiKey}";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = $"{LegalContextPrefix}{systemPrompt}\n\n{userPrompt}" }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = options.Temperature,
                        maxOutputTokens = options.MaxTokens,
                        topP = 0.95,
                        topK = 40,

                    },
                    safetySettings = new[]
                    {
                        // BLOCK_ONLY_HIGH: only block clearly harmful content.
                        // Legal cases legitimately discuss crimes, disputes, assault, etc.
                        // BLOCK_LOW_AND_ABOVE was too strict and caused false positives.
                        new { category = "HARM_CATEGORY_HARASSMENT", threshold = "BLOCK_ONLY_HIGH" },
                        new { category = "HARM_CATEGORY_HATE_SPEECH", threshold = "BLOCK_ONLY_HIGH" },
                        new { category = "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold = "BLOCK_ONLY_HIGH" },
                        new { category = "HARM_CATEGORY_DANGEROUS_CONTENT", threshold = "BLOCK_ONLY_HIGH" }
                    },
                    tools = new[]
                    {
                        new { googleSearch = new { } }
                    }
                };

                var jsonContent = JsonSerializer.Serialize(requestBody, Common.JsonOptions.Serialize);
                var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                _logger.LogInformation("Sending request to Gemini API with model: {Model}", model);

                var response = await client.PostAsync(endpoint, httpContent, cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError("Gemini API error: {StatusCode} - {Error}",
                        response.StatusCode, errorContent);
                    return Result<AIResponse>.Error(System.Net.HttpStatusCode.BadGateway, $"Gemini API error: {response.StatusCode}");
                }

                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                using var doc = JsonDocument.Parse(responseContent);
                var content = (string?)null;
                if (doc.RootElement.TryGetProperty("candidates", out var candidates)
                    && candidates.GetArrayLength() > 0
                    && candidates[0].TryGetProperty("content", out var contentProp)
                    && contentProp.TryGetProperty("parts", out var parts)
                    && parts.GetArrayLength() > 0
                    && parts[0].TryGetProperty("text", out var textProp))
                {
                    content = textProp.GetString();
                }
                else
                {
                    _logger.LogWarning("Gemini response missing expected fields. Raw: {Raw}", responseContent.Length > 500 ? responseContent[..500] : responseContent);
                    return Result<AIResponse>.Error(System.Net.HttpStatusCode.BadGateway, "Gemini returned an unexpected response format");
                }

                if (string.IsNullOrWhiteSpace(content))
                {
                    _logger.LogWarning("Gemini returned empty content");
                    return Result<AIResponse>.Error(System.Net.HttpStatusCode.BadGateway, "Gemini returned empty response");
                }

                AIUsageMetadata? usage = null;
                if (doc.RootElement.TryGetProperty("usageMetadata", out var usageMeta))
                {
                    var inputTokens = usageMeta.TryGetProperty("promptTokenCount", out var ptc) ? ptc.GetInt32() : 0;
                    var outputTokens = usageMeta.TryGetProperty("candidatesTokenCount", out var ctc) ? ctc.GetInt32() : 0;
                    var totalTokens = usageMeta.TryGetProperty("totalTokenCount", out var tc) ? tc.GetInt32() : 0;
                    usage = new AIUsageMetadata(inputTokens, outputTokens, totalTokens);
                }

                _logger.LogInformation("Successfully received response from Gemini (model: {Model}, tokens: {Tokens})",
                    model, usage?.TotalTokens ?? 0);
                return Result<AIResponse>.Success(new AIResponse(content, usage));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Gemini API");
                return Result<AIResponse>.Error(System.Net.HttpStatusCode.InternalServerError, "An error occurred while calling the AI provider. Please try again later.");
            }
        }
    }
}
