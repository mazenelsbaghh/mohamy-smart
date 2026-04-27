using Lawyer.Application.IServices.AI;
using Lawyer.Core.Enum;

namespace Lawyer.Application.IServices
{
    public interface IAiUsageTrackingService
    {
        Task RecordGeminiUsageAsync(Guid lawyerId, Guid? caseId, AiStepType stepType, string modelIdentifier, AIUsageMetadata? usage, CancellationToken ct);
        Task RecordOcrUsageAsync(Guid lawyerId, Guid? caseId, CancellationToken ct);
    }
}
