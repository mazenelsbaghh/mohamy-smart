using Hangfire;
using Lawyer.Application.Common.Interface;
using Lawyer.Application.Dtos.AppealBrief;
using Lawyer.Application.Dtos.AdminComplaint;
using Lawyer.Application.Dtos.Case;
using Lawyer.Application.Dtos.ExecRequest;
using Lawyer.Application.Dtos.LegalWarning;
using Lawyer.Application.Dtos.PreparingStatementOfClaims;
using Lawyer.Application.Dtos.RulingAnalysis;
using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Application.IServices;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Lawyer.Application.Services.Workflows;
namespace Lawyer.Application.Services
{
    public class AiJobWorker : IAiJobWorker
    {
        private const string UserCancelledMessage = "تم إلغاء التحليل بواسطة المستخدم";
        private readonly IApplicationDbContext _db;
        private readonly IFactAnalysisService _factAnalysisService;
        private readonly IDefenseService _defenseService;
        private readonly ISmartChatService _chatService;
        private readonly IPreparingStatementOfClaimsService _prepStatements;
        private readonly IAiJobNotificationService _notifications;
        private readonly IAppealBriefService _appealBriefService;
        private readonly IAdminComplaintService _adminComplaintService;
        private readonly ILegalWarningService _legalWarningService;
        private readonly IRulingAnalysisService _rulingAnalysisService;
        private readonly IExecRequestService _execRequestService;
        private readonly ICaseOcrService _ocrService;
        private readonly ILogger<AiJobWorker> _logger;


        /// Frontend sends camelCase JSON; C# DTOs use PascalCase — this bridges the gap.
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        public AiJobWorker(
            IApplicationDbContext db,
            IFactAnalysisService factAnalysisService,
            IDefenseService defenseService,
            ISmartChatService chatService,
            IPreparingStatementOfClaimsService prepStatements,
            IAiJobNotificationService notifications,
            IAppealBriefService appealBriefService,
            IAdminComplaintService adminComplaintService,
            ILegalWarningService legalWarningService,
            IRulingAnalysisService rulingAnalysisService,
            IExecRequestService execRequestService,
            ICaseOcrService ocrService,
            ILogger<AiJobWorker> logger)
        {
            _db = db;
            _factAnalysisService = factAnalysisService;
            _defenseService = defenseService;
            _chatService = chatService;
            _prepStatements = prepStatements;
            _notifications = notifications;
            _appealBriefService = appealBriefService;
            _adminComplaintService = adminComplaintService;
            _legalWarningService = legalWarningService;
            _rulingAnalysisService = rulingAnalysisService;
            _execRequestService = execRequestService;
            _ocrService = ocrService;
            _logger = logger;
        }

        // Keep a small retry budget for transient provider/network failures.
        [AutomaticRetry(Attempts = 2, DelaysInSeconds = new[] { 30, 120 })]
        public async Task ProcessAsync(Guid jobId, string? inputJson, CancellationToken? cancellationToken)
        {
            var ct = cancellationToken ?? CancellationToken.None;
            var dbContext = (DbContext)_db;

            var job = await _db.AiJobs.FindAsync(new object[] { jobId }, ct);
            if (job == null)
            {
                _logger.LogWarning("AiJobWorker: Job {JobId} not found in DB. Skipping.", jobId);
                return;
            }

            if (IsCancelledByUser(job))
            {
                _logger.LogInformation("AiJobWorker: Job {JobId} ({StepType}) was cancelled before processing started.", jobId, job.StepType);
                return;
            }

            job.Status = AiJobStatus.Processing;
            job.StartedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
            await _notifications.NotifyJobStatusChangedAsync(job);

            try
            {
                var caseEntity = await _db.Cases
                    .Where(c => c.Id == job.CaseId)
                    .Select(c => new { c.Id, c.Lawyer })
                    .FirstOrDefaultAsync(ct);
                var systemUserId = caseEntity?.Lawyer?.ApplicationUserId.ToString() ?? "";
                var resultJson = await ExecuteStepAsync(job.StepType, job.CaseId, inputJson, systemUserId, ct);
                await dbContext.Entry(job).ReloadAsync(ct);

                if (IsCancelledByUser(job))
                {
                    _logger.LogInformation("AiJobWorker: Job {JobId} ({StepType}) was cancelled during processing. Ignoring result.", jobId, job.StepType);
                    return;
                }

                job.Status = AiJobStatus.Completed;
                job.ResultJson = resultJson;
                job.CompletedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync(ct);
                await _notifications.NotifyJobCompletedAsync(job);

                _logger.LogInformation("AiJobWorker: Job {JobId} ({StepType}) completed.", jobId, job.StepType);
            }
            catch (Exception ex)
            {
                await dbContext.Entry(job).ReloadAsync(ct);
                if (IsCancelledByUser(job))
                {
                    _logger.LogInformation("AiJobWorker: Job {JobId} ({StepType}) was cancelled while failing. Keeping cancelled state.", jobId, job.StepType);
                    return;
                }

                job.Status = AiJobStatus.Failed;
                job.ErrorMessage = "حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.";
                job.CompletedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync(ct);
                await _notifications.NotifyJobFailedAsync(job);

                _logger.LogError(ex, "AiJobWorker: Job {JobId} ({StepType}) failed.", jobId, job.StepType);
                throw;
            }
        }

        private static bool IsCancelledByUser(AiJob job) =>
            job.Status == AiJobStatus.Failed && string.Equals(job.ErrorMessage, UserCancelledMessage, StringComparison.Ordinal);

        private async Task<string> ExecuteStepAsync(AiStepType step, Guid caseId, string? inputJson, string systemUserId, CancellationToken ct)
        {
            switch (step)
            {
                case AiStepType.FactAnalysis:
                {
                    var input = JsonSerializer.Deserialize<CaseAnalysisRequestDto>(inputJson!, _jsonOptions)!;
                    input.CaseId = caseId;
                    var result = await _factAnalysisService.AnalyzeCaseFactsAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "FactAnalysis failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.GenerateDefenses:
                {
                    var input = JsonSerializer.Deserialize<CaseDefensesRequestDto>(inputJson!, _jsonOptions)!;
                    input.CaseId = caseId;
                    var result = await _defenseService.GenerateCaseDefensesAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "GenerateDefenses failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.AnalysisDefense:
                {
                    var input = JsonSerializer.Deserialize<AnalyzeDefenseRequestDto>(inputJson!, _jsonOptions)!;
                    var result = await _defenseService.AnalyzeDefenseAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "AnalysisDefense failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.FinalRequirements:
                {
                    var input = JsonSerializer.Deserialize<FinalRequirementsRequestDto>(inputJson!, _jsonOptions)!;
                    input.CaseId = caseId;
                    var result = await _defenseService.GenerateFinalRequirementsAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "FinalRequirements failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.DefenseMemoDraft:
                {
                    _logger.LogInformation("AiJobWorker: Starting DefenseMemoDraft for Case {CaseId}", caseId);
                    var input = JsonSerializer.Deserialize<DefenseMemoDraftRequestDto>(inputJson!, _jsonOptions)!;
                    input.CaseId = caseId;
                    _logger.LogInformation("AiJobWorker: DefenseMemoDraft deserialized. Case={CaseId}, Defenses={Count}", caseId, input.ApprovedDefenses?.Count ?? 0);
                    var result = await _defenseService.GenerateDefenseMemoDraftAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "DefenseMemoDraft failed");
                    _logger.LogInformation("AiJobWorker: DefenseMemoDraft completed for Case {CaseId}", caseId);
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.LawsuitCaseType:
                {
                    var input = JsonSerializer.Deserialize<LawSuitCaseTypeRequestDto>(inputJson!, _jsonOptions)!;
                    var result = await _prepStatements.ClassifyLawSuitCaseTypeAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "LawsuitCaseType failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.LawsuitParties:
                {
                    var input = JsonSerializer.Deserialize<LawSuitPartiesRequestDto>(inputJson!, _jsonOptions)!;
                    var result = await _prepStatements.ExtractLawSuitPartiesAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "LawsuitParties failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.LawsuitSubjects:
                {
                    var input = JsonSerializer.Deserialize<LawSuitSubjectsRequestDto>(inputJson!, _jsonOptions)!;
                    var result = await _prepStatements.GenerateLawSuitSubjectsAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "LawsuitSubjects failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.LawsuitFacts:
                {
                    var input = JsonSerializer.Deserialize<LawSuitFactsRequestDto>(inputJson!, _jsonOptions)!;
                    var result = await _prepStatements.GenerateLawSuitFactsAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "LawsuitFacts failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.LawsuitLegalBasis:
                {
                    var input = JsonSerializer.Deserialize<LawSuitLegalBasisRequestDto>(inputJson!, _jsonOptions)!;
                    var result = await _prepStatements.GenerateLawSuitLegalBasisAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "LawsuitLegalBasis failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.LawsuitRequests:
                {
                    var input = JsonSerializer.Deserialize<LawSuitRequestsRequestDto>(inputJson!, _jsonOptions)!;
                    var result = await _prepStatements.GenerateLawSuitRequestsAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "LawsuitRequests failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.Ocr:
                    return await ExecuteOcrStepAsync(caseId, inputJson, systemUserId, ct);
                case AiStepType.Chat:
                    return await ExecuteChatStepAsync(caseId, inputJson, ct);
                case AiStepType.AppealBriefJudgmentData:
                case AiStepType.AppealBriefReasoningAnalysis:
                case AiStepType.AppealBriefGrounds:
                case AiStepType.AppealBriefRequests:
                case AiStepType.AppealBriefLegalBasis:
                case AiStepType.AppealBriefAssembly:
                    return await ExecuteAppealBriefStepAsync(step, caseId, inputJson, ct);
                case AiStepType.AdminComplaintClassification:
                case AiStepType.AdminComplaintFacts:
                case AiStepType.AdminComplaintViolation:
                case AiStepType.AdminComplaintRequests:
                case AiStepType.AdminComplaintAssembly:
                    return await ExecuteAdminComplaintStepAsync(step, caseId, inputJson, ct);
                case AiStepType.RulingAnalysisOperative:
                case AiStepType.RulingAnalysisReasoning:
                case AiStepType.RulingAnalysisDefectEvaluation:
                case AiStepType.RulingAnalysisFeasibilityReport:
                    return await ExecuteRulingAnalysisStepAsync(step, caseId, inputJson, ct);
                case AiStepType.LegalWarningClassification:
                case AiStepType.LegalWarningBodyDraft:
                case AiStepType.LegalWarningAssembly:
                    return await ExecuteLegalWarningStepAsync(step, caseId, inputJson, ct);
                case AiStepType.ExecRequestClassification:
                case AiStepType.ExecRequestDrafting:
                case AiStepType.ExecRequestAssembly:
                    return await ExecuteExecRequestStepAsync(step, caseId, inputJson, ct);
                default:
                    throw new NotImplementedException($"Step type {step} not yet implemented in AiJobWorker.");
            }
        }

        private async Task<string> ExecuteAdminComplaintStepAsync(AiStepType step, Guid caseId, string? inputJson, CancellationToken ct)
        {
            var workflow = await ResolveLatestWorkflowAsync(
                _db.AdminComplaintWorkflows, 
                caseId, 
                (cId, lId, token) => _adminComplaintService.StartWorkflowAsync(new Lawyer.Application.Dtos.AdminComplaint.StartComplaintWorkflowRequest { CaseId = cId }, lId, token), 
                ct);
            var result = await _adminComplaintService.RunStepAsync(
                workflow.Id,
                Lawyer.Application.Services.Workflows.PipelineRegistry.GetStepNumber(step),
                new RunComplaintStepRequest { Input = inputJson },
                workflow.LawyerId,
                ct);

            return SerializeWorkflowResult(step, result);
        }

        private async Task<string> ExecuteLegalWarningStepAsync(AiStepType step, Guid caseId, string? inputJson, CancellationToken ct)
        {
            var workflow = await ResolveLatestWorkflowAsync(
                _db.LegalWarningWorkflows, 
                caseId, 
                (cId, lId, token) => _legalWarningService.StartWorkflowAsync(new Lawyer.Application.Dtos.LegalWarning.StartLegalWarningRequest { CaseId = cId }, lId, token), 
                ct);
            var result = await _legalWarningService.RunStepAsync(
                workflow.Id,
                Lawyer.Application.Services.Workflows.PipelineRegistry.GetStepNumber(step),
                new RunWarningStepRequest { Input = inputJson },
                workflow.LawyerId,
                ct);

            return SerializeWorkflowResult(step, result);
        }

        private async Task<string> ExecuteRulingAnalysisStepAsync(AiStepType step, Guid caseId, string? inputJson, CancellationToken ct)
        {
            var workflow = await ResolveLatestWorkflowAsync(
                _db.RulingAnalysisWorkflows, 
                caseId, 
                (cId, lId, token) => _rulingAnalysisService.StartWorkflowAsync(new Lawyer.Application.Dtos.RulingAnalysis.StartRulingWorkflowRequest { CaseId = cId }, lId, token), 
                ct);
            var result = await _rulingAnalysisService.RunStepAsync(
                workflow.Id,
                Lawyer.Application.Services.Workflows.PipelineRegistry.GetStepNumber(step),
                new RunRulingStepRequest { Input = inputJson },
                workflow.LawyerId,
                ct);

            return SerializeWorkflowResult(step, result);
        }

        private async Task<string> ExecuteExecRequestStepAsync(AiStepType step, Guid caseId, string? inputJson, CancellationToken ct)
        {
            var workflow = await ResolveLatestWorkflowAsync(
                _db.ExecRequestWorkflows, 
                caseId, 
                (cId, lId, token) => _execRequestService.StartWorkflowAsync(new Lawyer.Application.Dtos.ExecRequest.StartExecRequestRequest { CaseId = cId }, lId, token), 
                ct);
            var result = await _execRequestService.RunStepAsync(
                workflow.Id,
                Lawyer.Application.Services.Workflows.PipelineRegistry.GetStepNumber(step),
                new RunExecStepRequest { Input = inputJson },
                workflow.LawyerId,
                ct);

            return SerializeWorkflowResult(step, result);
        }

        private async Task<string> ExecuteAppealBriefStepAsync(AiStepType step, Guid caseId, string? inputJson, CancellationToken ct)
        {
            var workflow = await ResolveLatestWorkflowAsync(
                _db.AppealWorkflows, 
                caseId, 
                (cId, lId, token) => _appealBriefService.StartWorkflowBaseAsync(cId, lId, token), 
                ct);
            var result = await _appealBriefService.RunStepAsync(
                workflow.Id,
                Lawyer.Application.Services.Workflows.PipelineRegistry.GetStepNumber(step),
                new RunStepRequest { Input = inputJson },
                workflow.LawyerId,
                ct);

            return SerializeWorkflowResult(step, result);
        }

        private async Task<string> ExecuteChatStepAsync(Guid caseId, string? inputJson, CancellationToken ct)
        {
            var input = JsonSerializer.Deserialize<ChatRequestDto>(inputJson!, _jsonOptions)!;
            input.ContextCaseId ??= caseId;

            var lawyerId = await GetLawyerIdForCaseAsync(caseId, ct);
            var result = await _chatService.ChatAsync(Guid.Parse(lawyerId), input, ct);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException(result.Message ?? "Chat failed");
            }

            return JsonSerializer.Serialize(result.Data, _jsonOptions);
        }

        private static string SerializeWorkflowResult(AiStepType step, Result<object> result)
        {
            if (!result.Succeeded)
            {
                throw new InvalidOperationException(result.Message ?? $"{step} failed");
            }

            return JsonSerializer.Serialize(result.Data, _jsonOptions);
        }

        private async Task<string> ExecuteOcrStepAsync(Guid caseId, string? inputJson, string systemUserId, CancellationToken ct)
        {
            var text = inputJson ?? "";
            var result = await _ocrService.GenerateCaseFromTextAsync(text, new List<AvailableCaseTypeDto>(), systemUserId, ct);
            if (!result.Succeeded) throw new Exception(result.Message ?? "OCR failed");
            return JsonSerializer.Serialize(result.Data, _jsonOptions);
        }

        private async Task<TWorkflow> ResolveLatestWorkflowAsync<TWorkflow>(
            IQueryable<TWorkflow> workflows, 
            Guid caseId, 
            Func<Guid, string, CancellationToken, Task> createWorkflowAction,
            CancellationToken ct) 
            where TWorkflow : Lawyer.Core.Models.WorkflowBase
        {
            var workflow = await workflows
                .AsNoTracking()
                .Where(w => w.CaseId == caseId)
                .OrderByDescending(w => w.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (workflow == null)
            {
                var lawyerId = await GetLawyerIdForCaseAsync(caseId, ct);
                await createWorkflowAction(caseId, lawyerId, ct);

                workflow = await workflows
                    .AsNoTracking()
                    .Where(w => w.CaseId == caseId)
                    .OrderByDescending(w => w.CreatedAt)
                    .FirstOrDefaultAsync(ct);

                if (workflow == null)
                    throw new InvalidOperationException($"Failed to create and resolve workflow for Case {caseId}");
            }

            return workflow;
        }

        private async Task<string> GetLawyerIdForCaseAsync(Guid caseId, CancellationToken ct)
        {
            var c = await _db.Cases.FirstOrDefaultAsync(x => x.Id == caseId, ct);
            if (c == null) throw new InvalidOperationException("Case not found");
            return c.LawyerId.ToString();
        }
    }
}
