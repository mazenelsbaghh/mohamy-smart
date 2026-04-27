using Hangfire;

namespace Lawyer.Application.IServices
{
    public interface IAiJobWorker
    {
        [AutomaticRetry(Attempts = 2, DelaysInSeconds = new[] { 30, 120 })]
        Task ProcessAsync(Guid jobId, string? inputJson, CancellationToken? cancellationToken);
    }
}
