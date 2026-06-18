using Lawyer.Application.IServices;
using Lawyer.Core.Models;
using Lawyer.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Lawyer.Services
{
    public class AiJobNotificationService : IAiJobNotificationService
    {
        private readonly IHubContext<AiJobHub> _hubContext;
        private readonly ILogger<AiJobNotificationService> _logger;

        public AiJobNotificationService(IHubContext<AiJobHub> hubContext, ILogger<AiJobNotificationService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task NotifyJobStatusChangedAsync(AiJob job)
        {
            _logger.LogInformation("SignalR: Sending JobStatusChanged to group case-{CaseId} for job {JobId} ({StepType}) status={Status}", job.CaseId, job.Id, job.StepType, job.Status);
            await _hubContext.Clients.Group($"case-{job.CaseId}")
                .SendAsync("JobStatusChanged", ToPayload(job));
        }

        public async Task NotifyJobCompletedAsync(AiJob job)
        {
            _logger.LogInformation("SignalR: Sending JobCompleted to group case-{CaseId} for job {JobId} ({StepType})", job.CaseId, job.Id, job.StepType);
            await _hubContext.Clients.Group($"case-{job.CaseId}")
                .SendAsync("JobCompleted", ToPayload(job));
        }

        public async Task NotifyJobFailedAsync(AiJob job)
        {
            _logger.LogInformation("SignalR: Sending JobFailed to group case-{CaseId} for job {JobId} ({StepType}) error={ErrorCode}", job.CaseId, job.Id, job.StepType, job.ErrorCode);
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
            errorCode = job.ErrorCode,
            charge = new
            {
                pointCost = job.PointCost,
                chargeState = job.ChargeState.ToString(),
                chargedPoints = job.ChargedPoints,
                chargeReason = job.ChargeReason,
                chargedAt = job.ChargedAt,
                isRepeatAttempt = job.IsRepeatAttempt,
                repeatKind = job.RepeatIntent?.ToString(),
                requiresConfirmation = job.IsRepeatAttempt && job.ConfirmationAcceptedAt == null,
                balance = (object?)null
            }
        };
    }
}
