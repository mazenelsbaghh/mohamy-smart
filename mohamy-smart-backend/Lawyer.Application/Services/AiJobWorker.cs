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
using System.Net;
using System.Text.Json;
using Lawyer.Application.Services.Workflows;
namespace Lawyer.Application.Services
{
    public class AiJobWorker : IAiJobWorker
    {
        private const string UserCancelledMessage = "تم إلغاء التحليل بواسطة المستخدم";
        private const string GenericFailureMessage = "حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.";
        private const string WorkflowConcurrencyMessage = "تم تحديث سير العمل أثناء تنفيذ التحليل. يرجى إعادة تحميل الصفحة ثم إعادة المحاولة.";
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
        private readonly IAiJobService _aiJobService;
        private readonly IAiPointAccountingService _points;
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
            IAiJobService aiJobService,
            IAiPointAccountingService points,
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
            _aiJobService = aiJobService;
            _points = points;
            _logger = logger;
        }

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
            IAiJobService aiJobService,
            ILogger<AiJobWorker> logger)
            : this(
                db,
                factAnalysisService,
                defenseService,
                chatService,
                prepStatements,
                notifications,
                appealBriefService,
                adminComplaintService,
                legalWarningService,
                rulingAnalysisService,
                execRequestService,
                ocrService,
                aiJobService,
                new AiPointAccountingService(db),
                logger)
        {
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

            try
            {
                var caseEntity = await _db.Cases
                    .Where(c => c.Id == job.CaseId)
                    .Select(c => new { c.Id, c.Lawyer })
                    .FirstOrDefaultAsync(ct);
                var systemUserId = caseEntity?.Lawyer?.ApplicationUserId.ToString() ?? "";
                var lawyerId = caseEntity?.Lawyer?.Id ?? Guid.Empty;

                var staleRun = await GetStaleRunDecisionAsync(job, ct);
                if (staleRun.Ignore)
                {
                    if (!string.IsNullOrWhiteSpace(staleRun.ActiveRunId))
                    {
                        await _aiJobService.IgnoreStaleCompletionAsync(job.Id, staleRun.ActiveRunId, systemUserId, ct);
                    }
                    else
                    {
                        await MarkJobIgnoredAsStaleAsync(job.Id, ct);
                    }

                    _logger.LogInformation("AiJobWorker: Job {JobId} ({StepType}) ignored before execution because RunId {RunId} is no longer active.", jobId, job.StepType, job.RunId);
                    return;
                }

                job.Status = AiJobStatus.Processing;
                job.StartedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync(ct);
                await _notifications.NotifyJobStatusChangedAsync(job);

                var resultJson = await ExecuteStepAsync(job, inputJson, systemUserId, ct);
                await dbContext.Entry(job).ReloadAsync(ct);

                if (IsCancelledByUser(job))
                {
                    _logger.LogInformation("AiJobWorker: Job {JobId} ({StepType}) was cancelled during processing. Ignoring result.", jobId, job.StepType);
                    return;
                }

                job.Status = AiJobStatus.Completed;
                job.ResultJson = resultJson;
                job.CompletedAt = DateTime.UtcNow;
                if (lawyerId != Guid.Empty)
                {
                    var chargeResult = await _points.ChargeSuccessfulJobAsync(job, lawyerId, ct);
                    if (!chargeResult.Succeeded)
                    {
                        throw new InvalidOperationException(chargeResult.Message ?? "AI point charge could not be finalized.");
                    }
                }
                await _db.SaveChangesAsync(ct);
                await _notifications.NotifyJobCompletedAsync(job);

                _logger.LogInformation("AiJobWorker: Job {JobId} ({StepType}) completed.", jobId, job.StepType);
            }
            catch (WorkflowConcurrencyException ex)
            {
                _logger.LogWarning(ex, "AiJobWorker: Job {JobId} ({StepType}) hit a workflow concurrency conflict.", jobId, job.StepType);
                await PersistJobConflictAsync(jobId, WorkflowConcurrencyMessage, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AiJobWorker: Job {JobId} ({StepType}) failed.", jobId, job.StepType);
                await PersistJobFailureAsync(jobId, GenericFailureMessage, ct);
                throw;
            }
        }

        private static bool IsCancelledByUser(AiJob job) =>
            job.Status == AiJobStatus.Failed && string.Equals(job.ErrorMessage, UserCancelledMessage, StringComparison.Ordinal);

        private async Task<string> ExecuteStepAsync(AiJob job, string? inputJson, string systemUserId, CancellationToken ct)
        {
            var step = job.StepType;
            var caseId = job.CaseId;

            switch (step)
            {
                case AiStepType.FactAnalysis:
                {
	                    var input = JsonSerializer.Deserialize<CaseAnalysisRequestDto>(inputJson!, _jsonOptions)!;
	                    input.CaseId = caseId;
	                    input.RunId ??= job.RunId;
	                    var result = await _factAnalysisService.AnalyzeCaseFactsAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "FactAnalysis failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.GenerateDefenses:
                {
	                    var input = JsonSerializer.Deserialize<CaseDefensesRequestDto>(inputJson!, _jsonOptions)!;
	                    input.CaseId = caseId;
	                    input.RunId ??= job.RunId;
	                    var result = await _defenseService.GenerateCaseDefensesAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "GenerateDefenses failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.AnalysisDefense:
                {
	                    var input = JsonSerializer.Deserialize<AnalyzeDefenseRequestDto>(inputJson!, _jsonOptions)!;
	                    input.CaseId = caseId;
	                    input.RunId ??= job.RunId;
	                    var result = await _defenseService.AnalyzeDefenseAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "AnalysisDefense failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.FinalRequirements:
                {
	                    var input = JsonSerializer.Deserialize<FinalRequirementsRequestDto>(inputJson!, _jsonOptions)!;
	                    input.CaseId = caseId;
	                    input.RunId ??= job.RunId;
	                    var result = await _defenseService.GenerateFinalRequirementsAsync(input, systemUserId, ct);
                    if (!result.Succeeded) throw new Exception(result.Message ?? "FinalRequirements failed");
                    return JsonSerializer.Serialize(result.Data, _jsonOptions);
                }
                case AiStepType.DefenseMemoDraft:
                {
                    _logger.LogInformation("AiJobWorker: Starting DefenseMemoDraft for Case {CaseId}", caseId);
	                    var input = JsonSerializer.Deserialize<DefenseMemoDraftRequestDto>(inputJson!, _jsonOptions)!;
	                    input.JobId = job.Id;
	                    input.CaseId = caseId;
	                    input.RunId ??= job.RunId;
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
                    return await ExecuteAppealBriefStepAsync(step, caseId, inputJson, ct, job.RunId, job.WorkflowType, job.StepNumber);
                case AiStepType.AdminComplaintClassification:
                case AiStepType.AdminComplaintFacts:
                case AiStepType.AdminComplaintViolation:
                case AiStepType.AdminComplaintRequests:
                case AiStepType.AdminComplaintAssembly:
                    return await ExecuteAdminComplaintStepAsync(step, caseId, inputJson, ct, job.RunId, job.WorkflowType, job.StepNumber);
                case AiStepType.RulingAnalysisOperative:
                case AiStepType.RulingAnalysisReasoning:
                case AiStepType.RulingAnalysisDefectEvaluation:
                case AiStepType.RulingAnalysisFeasibilityReport:
                    return await ExecuteRulingAnalysisStepAsync(step, caseId, inputJson, ct, job.RunId, job.WorkflowType, job.StepNumber);
                case AiStepType.LegalWarningClassification:
                case AiStepType.LegalWarningBodyDraft:
                case AiStepType.LegalWarningAssembly:
                    return await ExecuteLegalWarningStepAsync(step, caseId, inputJson, ct, job.RunId, job.WorkflowType, job.StepNumber);
                case AiStepType.ExecRequestClassification:
                case AiStepType.ExecRequestDrafting:
                case AiStepType.ExecRequestAssembly:
                    return await ExecuteExecRequestStepAsync(step, caseId, inputJson, ct, job.RunId, job.WorkflowType, job.StepNumber);
                default:
                    throw new NotImplementedException($"Step type {step} not yet implemented in AiJobWorker.");
            }
        }

        private async Task<string> ExecuteAdminComplaintStepAsync(AiStepType step, Guid caseId, string? inputJson, CancellationToken ct, string? runId = null, string? workflowType = null, int? stepNumber = null)
        {
            var workflow = await ResolveWorkflowForJobAsync(
                _db.AdminComplaintWorkflows, 
                caseId, 
                runId,
                (cId, lId, token) => _adminComplaintService.StartWorkflowAsync(new Lawyer.Application.Dtos.AdminComplaint.StartComplaintWorkflowRequest { CaseId = cId }, lId, token), 
                ct);
            var result = await _adminComplaintService.RunStepAsync(
                workflow.Id,
                stepNumber ?? Lawyer.Application.Services.Workflows.PipelineRegistry.GetStepNumber(step),
                new RunComplaintStepRequest { Input = inputJson },
                workflow.LawyerId,
                ct);

            return SerializeWorkflowResult(step, result);
        }

        private async Task<string> ExecuteLegalWarningStepAsync(AiStepType step, Guid caseId, string? inputJson, CancellationToken ct, string? runId = null, string? workflowType = null, int? stepNumber = null)
        {
            var workflow = await ResolveWorkflowForJobAsync(
                _db.LegalWarningWorkflows, 
                caseId, 
                runId,
                (cId, lId, token) => _legalWarningService.StartWorkflowAsync(new Lawyer.Application.Dtos.LegalWarning.StartLegalWarningRequest { CaseId = cId }, lId, token), 
                ct);
            var result = await _legalWarningService.RunStepAsync(
                workflow.Id,
                stepNumber ?? Lawyer.Application.Services.Workflows.PipelineRegistry.GetStepNumber(step),
                new RunWarningStepRequest { Input = inputJson },
                workflow.LawyerId,
                ct);

            return SerializeWorkflowResult(step, result);
        }

        private async Task<string> ExecuteRulingAnalysisStepAsync(AiStepType step, Guid caseId, string? inputJson, CancellationToken ct, string? runId = null, string? workflowType = null, int? stepNumber = null)
        {
            var workflow = await ResolveWorkflowForJobAsync(
                _db.RulingAnalysisWorkflows, 
                caseId, 
                runId,
                (cId, lId, token) => _rulingAnalysisService.StartWorkflowAsync(new Lawyer.Application.Dtos.RulingAnalysis.StartRulingWorkflowRequest { CaseId = cId }, lId, token), 
                ct);
            var result = await _rulingAnalysisService.RunStepAsync(
                workflow.Id,
                stepNumber ?? Lawyer.Application.Services.Workflows.PipelineRegistry.GetStepNumber(step),
                new RunRulingStepRequest { Input = inputJson },
                workflow.LawyerId,
                ct);

            return SerializeWorkflowResult(step, result);
        }

        private async Task<string> ExecuteExecRequestStepAsync(AiStepType step, Guid caseId, string? inputJson, CancellationToken ct, string? runId = null, string? workflowType = null, int? stepNumber = null)
        {
            var workflow = await ResolveWorkflowForJobAsync(
                _db.ExecRequestWorkflows, 
                caseId, 
                runId,
                (cId, lId, token) => _execRequestService.StartWorkflowAsync(new Lawyer.Application.Dtos.ExecRequest.StartExecRequestRequest { CaseId = cId }, lId, token), 
                ct);
            var result = await _execRequestService.RunStepAsync(
                workflow.Id,
                stepNumber ?? Lawyer.Application.Services.Workflows.PipelineRegistry.GetStepNumber(step),
                new RunExecStepRequest { Input = inputJson },
                workflow.LawyerId,
                ct);

            return SerializeWorkflowResult(step, result);
        }

        private async Task<string> ExecuteAppealBriefStepAsync(AiStepType step, Guid caseId, string? inputJson, CancellationToken ct, string? runId = null, string? workflowType = null, int? stepNumber = null)
        {
            var workflow = await ResolveWorkflowForJobAsync(
                _db.AppealWorkflows, 
                caseId, 
                runId,
                (cId, lId, token) => _appealBriefService.StartWorkflowBaseAsync(cId, lId, token), 
                ct);
            var result = await _appealBriefService.RunStepAsync(
                workflow.Id,
                stepNumber ?? Lawyer.Application.Services.Workflows.PipelineRegistry.GetStepNumber(step),
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
                if (result.StatusCode == HttpStatusCode.Conflict)
                {
                    throw new WorkflowConcurrencyException(result.Message);
                }

                throw new InvalidOperationException(result.Message ?? $"{step} failed");
            }

            return JsonSerializer.Serialize(result.Data, _jsonOptions);
        }

        private async Task PersistJobFailureAsync(Guid jobId, string errorMessage, CancellationToken ct)
        {
            var dbContext = (DbContext)_db;
            dbContext.ChangeTracker.Clear();

            var job = await _db.AiJobs.FindAsync(new object[] { jobId }, ct);
            if (job == null)
            {
                _logger.LogWarning("AiJobWorker: Job {JobId} disappeared before failure state could be persisted.", jobId);
                return;
            }

            if (IsCancelledByUser(job))
            {
                _logger.LogInformation("AiJobWorker: Job {JobId} ({StepType}) was cancelled while failing. Keeping cancelled state.", jobId, job.StepType);
                return;
            }

            job.Status = AiJobStatus.Failed;
            job.ErrorMessage = errorMessage;
            job.CompletedAt = DateTime.UtcNow;
            var lawyerId = await GetLawyerGuidForCaseAsync(job.CaseId, ct);
            if (lawyerId != Guid.Empty)
            {
                await _points.MarkNoChargeAsync(job, lawyerId, AiPointReasonCode.Failed, "لم يتم خصم أي نقاط لأن الطلب لم يكتمل بنجاح.", ct);
            }
            await _db.SaveChangesAsync(ct);
            await _notifications.NotifyJobFailedAsync(job);
        }

        private async Task PersistJobConflictAsync(Guid jobId, string errorMessage, CancellationToken ct)
        {
            var dbContext = (DbContext)_db;
            dbContext.ChangeTracker.Clear();

            var job = await _db.AiJobs.FindAsync(new object[] { jobId }, ct);
            if (job == null)
            {
                _logger.LogWarning("AiJobWorker: Job {JobId} disappeared before conflict state could be persisted.", jobId);
                return;
            }

            if (IsCancelledByUser(job))
            {
                _logger.LogInformation("AiJobWorker: Job {JobId} ({StepType}) was cancelled during conflict. Keeping cancelled state.", jobId, job.StepType);
                return;
            }

            job.Status = AiJobStatus.Conflict;
            job.ErrorMessage = errorMessage;
            job.CompletedAt = DateTime.UtcNow;
            var lawyerId = await GetLawyerGuidForCaseAsync(job.CaseId, ct);
            if (lawyerId != Guid.Empty)
            {
                await _points.MarkNoChargeAsync(job, lawyerId, AiPointReasonCode.Conflict, "لم يتم خصم أي نقاط لأن سير العمل تغيّر أثناء تنفيذ الطلب.", ct);
            }
            await _db.SaveChangesAsync(ct);
            await _notifications.NotifyJobFailedAsync(job);
        }

        private async Task<string> ExecuteOcrStepAsync(Guid caseId, string? inputJson, string systemUserId, CancellationToken ct)
        {
            var text = inputJson ?? "";
            var result = await _ocrService.GenerateCaseFromTextAsync(text, new List<AvailableCaseTypeDto>(), systemUserId, ct);
            if (!result.Succeeded) throw new Exception(result.Message ?? "OCR failed");
            return JsonSerializer.Serialize(result.Data, _jsonOptions);
        }

        private async Task<TWorkflow> ResolveWorkflowForJobAsync<TWorkflow>(
            IQueryable<TWorkflow> workflows, 
            Guid caseId, 
            string? runId,
            Func<Guid, string, CancellationToken, Task> createWorkflowAction,
            CancellationToken ct) 
            where TWorkflow : Lawyer.Core.Models.WorkflowBase
        {
            var workflowQuery = workflows.AsNoTracking().Where(w => w.CaseId == caseId);

            var workflow = !string.IsNullOrWhiteSpace(runId)
                ? await workflowQuery.FirstOrDefaultAsync(w => w.RunId == runId, ct)
                : await workflowQuery
                    .OrderByDescending(w => w.CreatedAt)
                    .FirstOrDefaultAsync(ct);

            if (workflow == null && !string.IsNullOrWhiteSpace(runId))
            {
                throw new InvalidOperationException($"Workflow run {runId} was not found for Case {caseId}");
            }

            if (workflow == null)
            {
                var lawyerId = await GetLawyerIdForCaseAsync(caseId, ct);
                await createWorkflowAction(caseId, lawyerId, ct);

                workflow = await workflowQuery
                    .OrderByDescending(w => w.CreatedAt)
                    .FirstOrDefaultAsync(ct);

                if (workflow == null)
                    throw new InvalidOperationException($"Failed to create and resolve workflow for Case {caseId}");
            }

            return workflow;
        }

        private async Task<(bool Ignore, string? ActiveRunId)> GetStaleRunDecisionAsync(AiJob job, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(job.RunId) || string.IsNullOrWhiteSpace(job.WorkflowType))
            {
                return (false, null);
            }

            if (job.WorkflowType == "preparing-statement-of-claims" || job.WorkflowType == "SmartAnalysis")
            {
                return (false, null);
            }

            var exact = await FindWorkflowByRunAsync(job.WorkflowType, job.CaseId, job.RunId, ct);
            var active = await FindLatestActiveWorkflowAsync(job.WorkflowType, job.CaseId, ct);

            if (exact == null)
            {
                return (true, active?.RunId);
            }

            if (exact.Status != WorkflowStatus.InProgress)
            {
                return (true, active?.RunId);
            }

            if (active != null && active.RunId != job.RunId)
            {
                return (true, active.RunId);
            }

            return (false, null);
        }

        private async Task<WorkflowBase?> FindWorkflowByRunAsync(string workflowType, Guid caseId, string runId, CancellationToken ct)
        {
            return workflowType switch
            {
                "appeal-brief" => await _db.AppealWorkflows.AsNoTracking().FirstOrDefaultAsync(w => w.CaseId == caseId && w.RunId == runId, ct),
                "admin-complaint" => await _db.AdminComplaintWorkflows.AsNoTracking().FirstOrDefaultAsync(w => w.CaseId == caseId && w.RunId == runId, ct),
                "ruling-analysis" => await _db.RulingAnalysisWorkflows.AsNoTracking().FirstOrDefaultAsync(w => w.CaseId == caseId && w.RunId == runId, ct),
                "legal-warning" => await _db.LegalWarningWorkflows.AsNoTracking().FirstOrDefaultAsync(w => w.CaseId == caseId && w.RunId == runId, ct),
                "exec-request" => await _db.ExecRequestWorkflows.AsNoTracking().FirstOrDefaultAsync(w => w.CaseId == caseId && w.RunId == runId, ct),
                _ => null,
            };
        }

        private async Task<WorkflowBase?> FindLatestActiveWorkflowAsync(string workflowType, Guid caseId, CancellationToken ct)
        {
            return workflowType switch
            {
                "appeal-brief" => await _db.AppealWorkflows.AsNoTracking().Where(w => w.CaseId == caseId && w.Status == WorkflowStatus.InProgress).OrderByDescending(w => w.UpdatedAt).FirstOrDefaultAsync(ct),
                "admin-complaint" => await _db.AdminComplaintWorkflows.AsNoTracking().Where(w => w.CaseId == caseId && w.Status == WorkflowStatus.InProgress).OrderByDescending(w => w.UpdatedAt).FirstOrDefaultAsync(ct),
                "ruling-analysis" => await _db.RulingAnalysisWorkflows.AsNoTracking().Where(w => w.CaseId == caseId && w.Status == WorkflowStatus.InProgress).OrderByDescending(w => w.UpdatedAt).FirstOrDefaultAsync(ct),
                "legal-warning" => await _db.LegalWarningWorkflows.AsNoTracking().Where(w => w.CaseId == caseId && w.Status == WorkflowStatus.InProgress).OrderByDescending(w => w.UpdatedAt).FirstOrDefaultAsync(ct),
                "exec-request" => await _db.ExecRequestWorkflows.AsNoTracking().Where(w => w.CaseId == caseId && w.Status == WorkflowStatus.InProgress).OrderByDescending(w => w.UpdatedAt).FirstOrDefaultAsync(ct),
                _ => null,
            };
        }

        private async Task MarkJobIgnoredAsStaleAsync(Guid jobId, CancellationToken ct)
        {
            var job = await _db.AiJobs.FindAsync(new object[] { jobId }, ct);
            if (job == null) return;

            job.Status = AiJobStatus.Completed;
            job.ErrorCode = "StaleIgnored";
            job.CompletedAt = DateTime.UtcNow;
            job.HangfireJobId = null;
            var lawyerId = await GetLawyerGuidForCaseAsync(job.CaseId, ct);
            if (lawyerId != Guid.Empty)
            {
                await _points.MarkNoChargeAsync(job, lawyerId, AiPointReasonCode.StaleIgnored, "لم يتم خصم أي نقاط لأن نتيجة الطلب تخص نسخة قديمة.", ct);
            }
            await _db.SaveChangesAsync(ct);
            await _notifications.NotifyJobCompletedAsync(job);
        }

        private async Task<string> GetLawyerIdForCaseAsync(Guid caseId, CancellationToken ct)
        {
            var c = await _db.Cases.FirstOrDefaultAsync(x => x.Id == caseId, ct);
            if (c == null) throw new InvalidOperationException("Case not found");
            return c.LawyerId.ToString();
        }

        private async Task<Guid> GetLawyerGuidForCaseAsync(Guid caseId, CancellationToken ct)
        {
            var c = await _db.Cases.AsNoTracking().FirstOrDefaultAsync(x => x.Id == caseId, ct);
            return c?.LawyerId ?? Guid.Empty;
        }
    }
}
