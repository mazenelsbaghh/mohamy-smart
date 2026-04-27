using Lawyer.Application.IServices.AI;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

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
        private readonly IServiceProvider _services;
        private readonly ILogger<GeminiHealthCheck> _logger;

        public GeminiHealthCheck(IServiceProvider services, ILogger<GeminiHealthCheck> logger)
        {
            _services = services;
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            // Run the actual ping in the background so app startup isn't blocked.
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _services.CreateScope();
                    var factory = scope.ServiceProvider.GetService<IAIProviderFactory>();
                    if (factory == null)
                    {
                        _logger.LogWarning("Gemini health check skipped: IAIProviderFactory not registered.");
                        return;
                    }

                    var provider = factory.GetProvider();
                    var result = await provider.SendChatCompletionAsync(
                        "ping",
                        "ping",
                        AIRequestOptions.Default with { MaxTokens = 10, Temperature = 0 },
                        cancellationToken);

                    if (result.Succeeded)
                        _logger.LogInformation("Gemini startup health check passed.");
                    else
                        _logger.LogWarning("Gemini startup health check failed: {Message}", result.Message);
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
