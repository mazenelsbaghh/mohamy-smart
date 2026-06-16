using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;

namespace Lawyer.API.Extensions
{
    /// <summary>
    /// Pings Gemini once at startup so misconfigured API keys / endpoints surface
    /// in the application log immediately instead of on the first user request.
    /// Logs success or failure — never throws (we don't want a transient AI outage
    /// to block the whole API from booting).
    /// </summary>
    public class GeminiHealthCheck : IHostedService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<GeminiHealthCheck> _logger;

        public GeminiHealthCheck(
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<GeminiHealthCheck> logger)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            if (!_configuration.GetValue("Gemini:StartupHealthCheckEnabled", true))
            {
                _logger.LogInformation("Gemini startup health check disabled.");
                return Task.CompletedTask;
            }

            // Run the actual ping in the background so app startup isn't blocked.
            _ = Task.Run(async () =>
            {
                try
                {
                    var apiKey = _configuration["Gemini:ApiKey"];
                    if (string.IsNullOrWhiteSpace(apiKey))
                    {
                        _logger.LogWarning("Gemini startup health check skipped: Gemini:ApiKey is not configured.");
                        return;
                    }

                    var model = _configuration["Gemini:Model"] ?? "gemini-3.5-flash";
                    var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
                    var payload = JsonSerializer.Serialize(new
                    {
                        contents = new[]
                        {
                            new
                            {
                                parts = new[] { new { text = "ping" } }
                            }
                        },
                        generationConfig = new
                        {
                            maxOutputTokens = 8,
                            temperature = 0
                        }
                    });

                    using var content = new StringContent(payload, Encoding.UTF8, "application/json");
                    var client = _httpClientFactory.CreateClient("GeminiStartupHealth");
                    using var response = await client.PostAsync(endpoint, content, cancellationToken);

                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("Gemini startup health check passed for model {Model}.", model);
                    }
                    else
                    {
                        _logger.LogWarning("Gemini startup health check failed for model {Model}: {StatusCode}", model, response.StatusCode);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Gemini startup health check threw an exception.");
                }
            }, cancellationToken);

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
