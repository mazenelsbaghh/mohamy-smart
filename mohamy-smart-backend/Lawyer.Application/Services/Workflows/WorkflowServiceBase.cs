using Lawyer.Application.Common;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text;
using System.Text.Json;
using static Lawyer.Application.Common.AnalysisHelpers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services.Workflows
{
    public abstract class WorkflowServiceBase<TWorkflow, TDto> : IWorkflowServiceBase<TDto>
        where TWorkflow : WorkflowBase, new()
        where TDto : class
    {
        protected readonly IUnitOfWork _unitOfWork;
        protected readonly ILogger _logger;
        protected readonly IAIProviderFactory _aiProviderFactory;
        protected readonly ICaseAccessValidator _caseAccessValidator;
        protected readonly IAiUsageTrackingService _trackingService;
        protected readonly PromptTemplateCache _promptCache;

        protected WorkflowServiceBase(
            IUnitOfWork unitOfWork,
            ILogger logger,
            IAIProviderFactory aiProviderFactory,
            IConfiguration config,
            ICaseAccessValidator caseAccessValidator,
            IAiUsageTrackingService trackingService,
            PromptTemplateCache promptCache)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _aiProviderFactory = aiProviderFactory;
            _caseAccessValidator = caseAccessValidator;
            _trackingService = trackingService;
            _promptCache = promptCache;
        }

        protected abstract int TotalSteps { get; }
        protected abstract string GetPromptFolderName();
        protected abstract string GetStepFileName(int step);
        protected abstract AiStepType GetStepType(int step);
        protected abstract TDto MapToDto(TWorkflow workflow);
        protected abstract string BuildPreviousStepsContext(TWorkflow workflow, int currentStep);
        protected abstract TWorkflow CreateNewWorkflow(Guid caseId, string lawyerId);
        protected abstract string GetWorkflowTypeName();

        public async Task<Result<TDto>> StartWorkflowBaseAsync(Guid caseId, string lawyerId, CancellationToken ct)
        {
            try
            {
                if (caseId == Guid.Empty) return Result<TDto>.Error(HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                {
                    if (accessResult.Message == "القضية غير موجودة")
                        return Result<TDto>.Error(HttpStatusCode.NotFound, accessResult.Message);
                    return Result<TDto>.Error(HttpStatusCode.Forbidden, accessResult.Message);
                }

                var workflow = CreateNewWorkflow(caseId, lawyerId);
                await _unitOfWork.Repository<TWorkflow>().AddAsync(workflow);
                await _unitOfWork.SaveChangesAsync(ct);

                _logger.LogInformation("Workflow {WorkflowId} created for Case {CaseId}", workflow.Id, caseId);

                return Result<TDto>.Success(MapToDto(workflow), "تم إنشاء سير العمل بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting workflow for Case {CaseId}", caseId);
                return Result<TDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء إنشاء سير العمل");
            }
        }

        public async Task<Result<TDto>> GetWorkflowAsync(int id, string lawyerId, CancellationToken ct)
        {
            try
            {
                var workflow = await _unitOfWork.Repository<TWorkflow>().FirstOrDefaultAsync(x => x.Id == id, ct);
                if (workflow == null) return Result<TDto>.Error(HttpStatusCode.NotFound, "سير العمل غير موجود");
                if (workflow.LawyerId != lawyerId) return Result<TDto>.Error(HttpStatusCode.Forbidden, "ليس لديك صلاحية على هذا سير العمل");

                return Result<TDto>.Success(MapToDto(workflow));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting workflow {Id}", id);
                return Result<TDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب سير العمل");
            }
        }

        public async Task<Result<List<TDto>>> GetWorkflowsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct)
        {
            try
            {
                var workflows = await _unitOfWork.Repository<TWorkflow>().WhereAsync(x => x.CaseId == caseId && x.LawyerId == lawyerId, ct);
                return Result<List<TDto>>.Success(workflows.Select(MapToDto).ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting workflows for Case {CaseId}", caseId);
                return Result<List<TDto>>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب سير العمليات");
            }
        }

        public async Task<Result<bool>> AbandonWorkflowAsync(int id, string lawyerId, CancellationToken ct)
        {
            try
            {
                var workflow = await _unitOfWork.Repository<TWorkflow>().FirstOrDefaultAsync(x => x.Id == id, ct);
                if (workflow == null) return Result<bool>.Error(HttpStatusCode.NotFound, "سير العمل غير موجود");
                if (workflow.LawyerId != lawyerId) return Result<bool>.Error(HttpStatusCode.Forbidden, "ليس لديك صلاحية");
                if (workflow.Status != WorkflowStatus.InProgress) return Result<bool>.Error(HttpStatusCode.BadRequest, "لا يمكن ترك سير عمل ليس قيد التقدم");

                // Snapshot all step outputs before abandoning so the lawyer can restore later.
                var outputs = new Dictionary<string, object?>();
                for (int step = 1; step <= workflow.TotalSteps; step++)
                {
                    var raw = workflow.GetStepOutput(step);
                    if (string.IsNullOrWhiteSpace(raw)) continue;
                    try { outputs[step.ToString()] = JsonSerializer.Deserialize<object>(raw); }
                    catch { outputs[step.ToString()] = raw; }
                }

                if (outputs.Count > 0)
                {
                    var snapshot = new WorkflowSnapshot
                    {
                        CaseId = workflow.CaseId,
                        LawyerId = lawyerId,
                        WorkflowType = GetWorkflowTypeName(),
                        OutputsJson = JsonSerializer.Serialize(outputs),
                        CurrentStep = workflow.CurrentStep,
                        CreatedAt = DateTime.UtcNow,
                    };
                    await _unitOfWork.Repository<WorkflowSnapshot>().AddAsync(snapshot);
                }

                workflow.Status = WorkflowStatus.Abandoned;
                workflow.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Repository<TWorkflow>().Update(workflow);
                await _unitOfWork.SaveChangesAsync(ct);

                return Result<bool>.Success(true, "تم ترك سير العمل");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error abandoning workflow {Id}", id);
                return Result<bool>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء ترك سير العمل");
            }
        }

        public async Task<Result<object>> RunStepBaseAsync(int workflowId, int stepNumber, string input, string lawyerId, CancellationToken ct)
        {
            try
            {
                var workflow = await _unitOfWork.Repository<TWorkflow>().FirstOrDefaultAsync(x => x.Id == workflowId, ct);
                if (workflow == null) return Result<object>.Error(HttpStatusCode.NotFound, "سير العمل غير موجود");
                if (workflow.LawyerId != lawyerId) return Result<object>.Error(HttpStatusCode.Forbidden, "ليس لديك صلاحية");
                if (workflow.Status == WorkflowStatus.Abandoned) return Result<object>.Error(HttpStatusCode.BadRequest, "سير العمل متروك");
                if (stepNumber < 1 || stepNumber > TotalSteps) return Result<object>.Error(HttpStatusCode.BadRequest, "رقم خطوة غير صالح");
                if (stepNumber > workflow.CurrentStep) workflow.CurrentStep = stepNumber;

                var caseEntity = await _unitOfWork.Repository<Case>().FirstOrDefaultAsync(x => x.Id == workflow.CaseId, ct, x => x.CaseType);
                if (caseEntity == null) return Result<object>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var systemPrompt = await _promptCache.GetAsync(Path.Combine(GetPromptFolderName(), GetStepFileName(stepNumber)), ct);
                var userPrompt = BuildStepSpecificUserPrompt(workflow, caseEntity, stepNumber, input);

                var stepType = GetStepType(stepNumber);
                var model = await _aiProviderFactory.GetModelForStepAsync(stepType);
                var aiResult = await _aiProviderFactory.GetProvider().SendChatCompletionAsync(systemPrompt, userPrompt, AIRequestOptions.ForAnalysis with { Model = model }, ct);

                if (!aiResult.Succeeded || aiResult.Data == null || string.IsNullOrWhiteSpace(aiResult.Data.Content)) return Result<object>.Error(HttpStatusCode.InternalServerError, $"فشل في تنفيذ الخطوة {stepNumber}");

                var cleanedJson = CleanJsonResponse(aiResult.Data.Content);

                await _trackingService.RecordGeminiUsageAsync(Guid.Parse(lawyerId), workflow.CaseId, stepType, model ?? "", aiResult.Data.Usage, CancellationToken.None);

                object validatedOutput;
                try
                {
                    validatedOutput = StepOutputSchemas.Normalize((int)GetStepType(stepNumber), cleanedJson, GetWorkflowTypeName());
                }
                catch (SchemaValidationException svex)
                {
                    var failureRecord = new ValidationFailureRecord
                    {
                        WorkflowType = svex.WorkflowType,
                        StepType = svex.StepType,
                        OccurredAt = DateTime.UtcNow,
                        ErrorSummary = svex.ErrorSummary,
                        RawOutput = svex.RawOutput,
                        CaseId = workflow.CaseId,
                        LawyerId = lawyerId
                    };
                    await _unitOfWork.Repository<ValidationFailureRecord>().AddAsync(failureRecord);
                    await _unitOfWork.SaveChangesAsync(ct);

                    _logger.LogWarning("Schema validation failed for workflow {WorkflowType} step {StepType}: {Error}", svex.WorkflowType, svex.StepType, svex.ErrorSummary);
                    return Result<object>.Error(HttpStatusCode.BadGateway, $"فشل التحقق من صحة مخرجات الذكاء الاصطناعي: {svex.ErrorSummary}");
                }

                cleanedJson = JsonSerializer.Serialize(validatedOutput, Common.JsonOptions.Serialize);

                int originalStep = workflow.CurrentStep;

                workflow.SetStepOutput(stepNumber, cleanedJson);

                if (stepNumber < originalStep)
                {
                    for (int i = stepNumber + 1; i <= TotalSteps; i++)
                    {
                        workflow.SetStepOutput(i, null);
                    }
                    if (workflow.Status == WorkflowStatus.Completed) workflow.Status = WorkflowStatus.InProgress;
                }

                workflow.UpdatedAt = DateTime.UtcNow;

                if (stepNumber == TotalSteps)
                {
                    workflow.Status = WorkflowStatus.Completed;
                }
                else
                {
                    workflow.CurrentStep = stepNumber + 1;
                }

                await _unitOfWork.Repository<TWorkflow>().Update(workflow);
                await _unitOfWork.SaveChangesAsync(ct);

                return Result<object>.Success(new { stepNumber, output = cleanedJson, workflow.CurrentStep, workflow.Status });
            }
            catch (SchemaValidationException)
            {
                throw;
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException ex)
            {
                _logger.LogWarning(ex, "Concurrency conflict running workflow step {Step} for workflow {WorkflowId}", stepNumber, workflowId);
                return Result<object>.Error(HttpStatusCode.Conflict, "تم تحديث سير العمل من قبل مستخدم آخر. يرجى إعادة تحميل الصفحة.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running workflow step");
                return Result<object>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء تنفيذ الخطوة");
            }
        }

        public async Task<Result<object>> SaveEditedStepAsync(int workflowId, int stepNumber, string editedOutputJson, string lawyerId, CancellationToken ct)
        {
            try
            {
                var workflow = await _unitOfWork.Repository<TWorkflow>().FirstOrDefaultAsync(x => x.Id == workflowId, ct);
                if (workflow == null) return Result<object>.Error(HttpStatusCode.NotFound, "سير العمل غير موجود");
                if (workflow.LawyerId != lawyerId) return Result<object>.Error(HttpStatusCode.Forbidden, "ليس لديك صلاحية");
                if (stepNumber < 1 || stepNumber > TotalSteps) return Result<object>.Error(HttpStatusCode.BadRequest, "رقم خطوة غير صالح");

                workflow.SetStepOutput(stepNumber, editedOutputJson);
                workflow.UpdatedAt = DateTime.UtcNow;
                
                await _unitOfWork.Repository<TWorkflow>().Update(workflow);
                await _unitOfWork.SaveChangesAsync(ct);

                return Result<object>.Success(new { stepNumber, saved = true });
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException ex)
            {
                _logger.LogWarning(ex, "Concurrency conflict saving edited step {Step} for workflow {WorkflowId}", stepNumber, workflowId);
                return Result<object>.Error(HttpStatusCode.Conflict, "تم تحديث سير العمل من قبل مستخدم آخر. يرجى إعادة تحميل الصفحة.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving edited step");
                return Result<object>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء حفظ التعديل");
            }
        }

        public async Task<Result<object>> SaveDraftAsync(int workflowId, Dtos.Workflows.SaveWorkflowDraftRequest request, string lawyerId, CancellationToken ct)
        {
            try
            {
                var workflow = await _unitOfWork.Repository<TWorkflow>().FirstOrDefaultAsync(x => x.Id == workflowId, ct);
                if (workflow == null) return Result<object>.Error(HttpStatusCode.NotFound, "سير العمل غير موجود");
                if (workflow.LawyerId != lawyerId) return Result<object>.Error(HttpStatusCode.Forbidden, "ليس لديك صلاحية");
                if (request.StepIndex < 1 || request.StepIndex > TotalSteps) return Result<object>.Error(HttpStatusCode.BadRequest, "رقم خطوة غير صالح");

                string payloadJson = request.Payload is string str ? str : JsonSerializer.Serialize(request.Payload, Common.JsonOptions.Serialize);
                workflow.SetStepOutput(request.StepIndex, payloadJson);
                workflow.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.Repository<TWorkflow>().Update(workflow);
                await _unitOfWork.SaveChangesAsync(ct);

                return Result<object>.Success(new { stepNumber = request.StepIndex, lastSavedAt = workflow.UpdatedAt.ToString("O") });
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException ex)
            {
                _logger.LogWarning(ex, "Concurrency conflict saving draft step {StepIndex} for workflow {WorkflowId}", request.StepIndex, workflowId);
                return Result<object>.Error(HttpStatusCode.Conflict, "تم تحديث سير العمل من قبل مستخدم آخر. يرجى إعادة تحميل الصفحة.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving draft step {StepIndex} for workflow {WorkflowId}", request.StepIndex, workflowId);
                return Result<object>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء حفظ المسودة تلقائياً");
            }
        }

        protected virtual string BuildStepSpecificUserPrompt(TWorkflow workflow, Case caseEntity, int stepNumber, string? input)
        {
            var caseContext = BuildCaseContext(caseEntity, caseEntity.CaseType?.Title);
            var previousSteps = BuildPreviousStepsContext(workflow, stepNumber);
            return $"--- بيانات القضية الكاملة ---\n{caseContext}\n\n--- نواتج المراحل السابقة ---\n{previousSteps}\n\n--- مدخلات إضافية ---\n{(string.IsNullOrWhiteSpace(input) ? "لا يوجد" : input)}";
        }
    }
}
