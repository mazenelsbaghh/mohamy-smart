using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Lawyer.Application.Services
{
    public class AiUsageTrackingService : IAiUsageTrackingService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AiUsageTrackingService> _logger;

        public AiUsageTrackingService(IServiceScopeFactory scopeFactory, ILogger<AiUsageTrackingService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public Task RecordGeminiUsageAsync(
            Guid lawyerId,
            Guid? caseId,
            AiStepType stepType,
            string modelIdentifier,
            AIUsageMetadata? usage,
            CancellationToken ct,
            int? workflowId = null,
            string? workflowRunId = null,
            string? workflowType = null)
        {
            var inputTokens = usage?.InputTokens ?? 0;
            var outputTokens = usage?.OutputTokens ?? 0;
            var totalTokens = usage?.TotalTokens ?? 0;
            var cost = usage != null
                ? AiCostCalculator.CalculateGeminiCost(modelIdentifier, inputTokens, outputTokens)
                : 0m;

            var record = new AiUsageRecord
            {
                LawyerId = lawyerId,
                CaseId = caseId,
                WorkflowId = workflowId,
                WorkflowRunId = workflowRunId,
                WorkflowType = workflowType,
                AiStepType = stepType,
                ModelIdentifier = modelIdentifier,
                Provider = "Gemini",
                InputTokens = inputTokens,
                OutputTokens = outputTokens,
                TotalTokens = totalTokens,
                EstimatedCostUsd = cost,
                CreatedAt = DateTime.UtcNow
            };

            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                    await unitOfWork.Repository<AiUsageRecord>().AddAsync(record);
                    await unitOfWork.SaveChangesAsync(default);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to record AI usage for lawyer {LawyerId}", lawyerId);
                }
            }, ct);

            return Task.CompletedTask;
        }

        public Task RecordOcrUsageAsync(Guid lawyerId, Guid? caseId, CancellationToken ct)
        {
            var record = new AiUsageRecord
            {
                LawyerId = lawyerId,
                CaseId = caseId,
                AiStepType = AiStepType.Ocr,
                ModelIdentifier = "google-vision",
                Provider = "GoogleVision",
                InputTokens = 0,
                OutputTokens = 0,
                TotalTokens = 0,
                EstimatedCostUsd = AiCostCalculator.CalculateOcrCost(),
                CreatedAt = DateTime.UtcNow
            };

            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                    await unitOfWork.Repository<AiUsageRecord>().AddAsync(record);
                    await unitOfWork.SaveChangesAsync(default);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to record OCR usage for lawyer {LawyerId}", lawyerId);
                }
            }, ct);

            return Task.CompletedTask;
        }
    }
}
