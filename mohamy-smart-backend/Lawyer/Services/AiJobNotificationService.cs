using Lawyer.Application.IServices;
using Lawyer.Core.Models;
using Lawyer.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Lawyer.Services
{
    public class AiJobNotificationService : IAiJobNotificationService
    {
        private readonly IHubContext<AiJobHub> _hubContext;

        public AiJobNotificationService(IHubContext<AiJobHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyJobStatusChangedAsync(AiJob job)
        {
            await _hubContext.Clients.Group($"case-{job.CaseId}")
                .SendAsync("JobStatusChanged", ToPayload(job));
        }

        public async Task NotifyJobCompletedAsync(AiJob job)
        {
            await _hubContext.Clients.Group($"case-{job.CaseId}")
                .SendAsync("JobCompleted", ToPayload(job));
        }

        public async Task NotifyJobFailedAsync(AiJob job)
        {
            await _hubContext.Clients.Group($"case-{job.CaseId}")
                .SendAsync("JobFailed", ToPayload(job));
        }

        private static object ToPayload(AiJob job) => new
        {
            id = job.Id,
            caseId = job.CaseId,
            stepType = job.StepType.ToString(),
            status = job.Status.ToString(),
            resultJson = job.ResultJson,
            errorMessage = job.ErrorMessage,
            createdAt = job.CreatedAt,
            completedAt = job.CompletedAt,
            runId = job.RunId,
            workflowType = job.WorkflowType,
            stepNumber = job.StepNumber,
        };
    }
}
