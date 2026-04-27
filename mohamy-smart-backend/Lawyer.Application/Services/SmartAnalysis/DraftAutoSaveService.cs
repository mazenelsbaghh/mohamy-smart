using Lawyer.Application.Dtos.Workflows;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;

namespace Lawyer.Application.Services.SmartAnalysis
{
    public class DraftAutoSaveService : IDraftAutoSaveService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<DraftAutoSaveService> _logger;
        private readonly ICaseAccessValidator _caseAccessValidator;

        private static readonly JsonSerializerOptions CamelCaseOptions = Common.JsonOptions.Serialize;

        public DraftAutoSaveService(
            IUnitOfWork unitOfWork,
            ILogger<DraftAutoSaveService> logger,
            ICaseAccessValidator caseAccessValidator)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _caseAccessValidator = caseAccessValidator;
        }

        public async Task<Result<object>> SaveDraftAsync(Guid caseId, int stepNumber, SaveWorkflowDraftRequest request, string lawyerId, CancellationToken ct)
        {
            try
            {
                var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                    return Result<object>.Error(accessResult.StatusCode, accessResult.Message);

                if (stepNumber != 5)
                {
                    _logger.LogDebug("SaveDraftAsync: step {Step} data is persisted via dedicated tables/AiJob results; skipping.", stepNumber);
                    return Result<object>.Success(new { stepNumber, saved = true, lastSavedAt = DateTime.UtcNow.ToString("O") });
                }

                var draftJob = await _unitOfWork.Repository<Core.Models.AiJob>()
                    .FirstOrDefaultAsync(x => x.CaseId == caseId && x.StepType == Core.Enum.AiStepType.DefenseMemoDraft, ct);

                var now = DateTime.UtcNow;

                var payloadEl = request.Payload is System.Text.Json.JsonElement e ? e : default(System.Text.Json.JsonElement?);
                string memoHtml;
                bool isApproved = false;

                if (payloadEl is System.Text.Json.JsonElement je)
                {
                    if (je.ValueKind == System.Text.Json.JsonValueKind.Object)
                    {
                        memoHtml = je.TryGetProperty("memoHtml", out var htmlProp) && htmlProp.ValueKind == System.Text.Json.JsonValueKind.String
                            ? htmlProp.GetString() ?? string.Empty
                            : string.Empty;
                        isApproved = je.TryGetProperty("isApproved", out var approvedProp) && approvedProp.GetBoolean();
                    }
                    else if (je.ValueKind == System.Text.Json.JsonValueKind.String)
                    {
                        memoHtml = je.GetString() ?? string.Empty;
                    }
                    else
                    {
                        memoHtml = je.GetRawText();
                    }
                }
                else
                {
                    memoHtml = request.Payload is string s ? s : System.Text.Json.JsonSerializer.Serialize(request.Payload, new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase });
                }

                if (!isApproved && draftJob != null && !string.IsNullOrEmpty(draftJob.ResultJson))
                {
                    try
                    {
                        using var existingDoc = System.Text.Json.JsonDocument.Parse(draftJob.ResultJson);
                        if (existingDoc.RootElement.TryGetProperty("isApproved", out var existingApproved) && existingApproved.GetBoolean())
                            isApproved = true;
                    }
                    catch { }
                }

                var payloadJson = System.Text.Json.JsonSerializer.Serialize(new { memoHtml, isApproved }, new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase });

                if (draftJob == null)
                {
                    draftJob = new Core.Models.AiJob
                    {
                        CaseId = caseId,
                        StepType = Core.Enum.AiStepType.DefenseMemoDraft,
                        ResultJson = payloadJson,
                        Status = Core.Enum.AiJobStatus.Completed,
                        CreatedAt = now,
                        StartedAt = now,
                        CompletedAt = now
                    };
                    await _unitOfWork.Repository<Core.Models.AiJob>().AddAsync(draftJob);

                    _logger.LogInformation("Saved DefenseMemoDraft (auto-save) for Case ID: {CaseId}", caseId);
                }
                else
                {
                    if (draftJob.Status == Core.Enum.AiJobStatus.Queued || draftJob.Status == Core.Enum.AiJobStatus.Processing)
                    {
                        _logger.LogWarning("Skipping draft save for Case {CaseId}: DefenseMemoDraft job is {Status}", caseId, draftJob.Status);
                    }
                    else
                    {
                        draftJob.ResultJson = payloadJson;
                        draftJob.CompletedAt = now;
                        await _unitOfWork.Repository<Core.Models.AiJob>().Update(draftJob);

                        _logger.LogInformation("Updated DefenseMemoDraft for Case ID: {CaseId} (approved={Approved})", caseId, isApproved);
                    }
                }

                await _unitOfWork.SaveChangesAsync(ct);

                return Result<object>.Success(new { stepNumber, saved = true, lastSavedAt = now.ToString("O") });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving SmartAnalysis draft for Case {CaseId}", caseId);
                return Result<object>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء حفظ المسودة");
            }
        }
    }
}
