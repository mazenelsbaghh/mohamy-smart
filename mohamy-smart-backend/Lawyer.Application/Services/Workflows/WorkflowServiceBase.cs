using Lawyer.Application.Common;
using Lawyer.Application.Dtos.Workflows;
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

        public virtual async Task<Result<Dtos.Workflows.WorkflowStartNewResponseDto>> StartNewRunAsync(Guid caseId, string lawyerId, CancellationToken ct)
        {
            try
            {
                if (caseId == Guid.Empty) return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                {
                    if (accessResult.Message == "القضية غير موجودة")
                        return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.NotFound, accessResult.Message);
                    return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.Forbidden, accessResult.Message);
                }

                var activeWorkflows = await GetWorkflowsToArchiveBeforeNewRunAsync(caseId, lawyerId, ct);

                foreach (var wf in activeWorkflows)
                {
                    await CreateWorkflowSnapshotAsync(wf, lawyerId, ct);
                    wf.Status = WorkflowStatus.Abandoned;
                    wf.UpdatedAt = DateTime.UtcNow;
                    await _unitOfWork.Repository<TWorkflow>().Update(wf);
                }

                var workflow = CreateNewWorkflow(caseId, lawyerId);
                workflow.RunId = Guid.NewGuid().ToString();
                workflow.CurrentStep = 1;
                workflow.CurrentAccessibleStep = 0;
                workflow.LastCompletedStep = 0;
                workflow.Status = WorkflowStatus.InProgress;
                workflow.CreatedAt = DateTime.UtcNow;
                workflow.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.Repository<TWorkflow>().AddAsync(workflow);
                await _unitOfWork.SaveChangesAsync(ct);

                _logger.LogInformation("New workflow run {RunId} created for Case {CaseId}", workflow.RunId, caseId);

                var (canStart, canResumeCurrent, canStartNew, currentRunCreatedAt) = await ComputeActionAvailabilityAsync(caseId, lawyerId, ct);

                var dto = new Dtos.Workflows.WorkflowStartNewResponseDto(
                    workflow.Id,
                    workflow.RunId,
                    workflow.CaseId,
                    GetWorkflowTypeName(),
                    workflow.Status.ToString(),
                    workflow.CurrentAccessibleStep,
                    workflow.LastCompletedStep,
                    false,
                    workflow.CreatedAt,
                    workflow.UpdatedAt,
                    canStart,
                    canResumeCurrent,
                    canStartNew,
                    currentRunCreatedAt
                );

                return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Success(dto, "تم إنشاء سير عمل جديد بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting new run for Case {CaseId}", caseId);
                return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء إنشاء سير العمل الجديد");
            }
        }

        private async Task<List<TWorkflow>> GetWorkflowsToArchiveBeforeNewRunAsync(Guid caseId, string lawyerId, CancellationToken ct)
        {
            var activeWorkflows = (await _unitOfWork.Repository<TWorkflow>()
                    .WhereAsync(x => x.CaseId == caseId && x.LawyerId == lawyerId && x.Status == WorkflowStatus.InProgress, ct))
                .OrderByDescending(w => w.UpdatedAt)
                .ToList();

            if (activeWorkflows.Count > 0) return activeWorkflows;

            var latestCompleted = (await _unitOfWork.Repository<TWorkflow>()
                    .WhereAsync(x => x.CaseId == caseId && x.LawyerId == lawyerId && x.Status == WorkflowStatus.Completed, ct))
                .OrderByDescending(w => w.UpdatedAt)
                .FirstOrDefault();

            return latestCompleted == null ? [] : [latestCompleted];
        }

        private async Task<List<TWorkflow>> GetInProgressWorkflowsToArchiveAsync(Guid caseId, string lawyerId, CancellationToken ct)
        {
            return (await _unitOfWork.Repository<TWorkflow>()
                    .WhereAsync(x => x.CaseId == caseId && x.LawyerId == lawyerId && x.Status == WorkflowStatus.InProgress, ct))
                .OrderByDescending(w => w.UpdatedAt)
                .ToList();
        }

        private async Task CreateWorkflowSnapshotAsync(TWorkflow workflow, string lawyerId, CancellationToken ct)
        {
            var outputs = new Dictionary<string, object?>();
            for (int step = 1; step <= TotalSteps; step++)
            {
                var raw = workflow.GetStepOutput(step);
                if (string.IsNullOrWhiteSpace(raw)) continue;
                try { outputs[step.ToString()] = JsonSerializer.Deserialize<object>(raw); }
                catch { outputs[step.ToString()] = raw; }
            }

            if (outputs.Count == 0) return;

            var snapshotLawyerId = await ResolveCanonicalSnapshotLawyerIdAsync(workflow.CaseId, lawyerId, ct);

            var snapshot = new WorkflowSnapshot
            {
                CaseId = workflow.CaseId,
                LawyerId = snapshotLawyerId,
                WorkflowType = GetWorkflowTypeName(),
                OutputsJson = JsonSerializer.Serialize(outputs),
                CurrentStep = workflow.CurrentStep,
                CreatedAt = DateTime.UtcNow,
            };
            await _unitOfWork.Repository<WorkflowSnapshot>().AddAsync(snapshot);
        }

        public virtual async Task<Result<Dtos.Workflows.WorkflowStartNewResponseDto>> StartFromSnapshotAsync(Guid caseId, int snapshotId, string lawyerId, CancellationToken ct)
        {
            try
            {
                if (caseId == Guid.Empty) return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.BadRequest, "معرف القضية غير صالح");
                if (snapshotId <= 0) return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.BadRequest, "معرف النسخة غير صالح");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                {
                    if (accessResult.Message == "القضية غير موجودة")
                        return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.NotFound, accessResult.Message);
                    return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.Forbidden, accessResult.Message);
                }

                var snapshot = await _unitOfWork.Repository<WorkflowSnapshot>()
                    .FirstOrDefaultAsync(x => x.Id == snapshotId, ct);
                if (snapshot == null) return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.NotFound, "النسخة غير موجودة");
                if (snapshot.CaseId != caseId || !await SnapshotBelongsToRequesterAsync(snapshot, lawyerId, ct))
                    return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.Forbidden, "ليس لديك صلاحية");
                if (!string.Equals(snapshot.WorkflowType, GetWorkflowTypeName(), StringComparison.OrdinalIgnoreCase))
                    return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.BadRequest, "نوع النسخة لا يطابق مسار العمل");

                var activeWorkflows = await GetInProgressWorkflowsToArchiveAsync(caseId, lawyerId, ct);

                foreach (var wf in activeWorkflows)
                {
                    wf.Status = WorkflowStatus.Abandoned;
                    wf.UpdatedAt = DateTime.UtcNow;
                    await _unitOfWork.Repository<TWorkflow>().Update(wf);
                }

                var workflow = CreateNewWorkflow(caseId, lawyerId);
                workflow.RunId = Guid.NewGuid().ToString();
                workflow.Status = WorkflowStatus.InProgress;
                workflow.CreatedAt = DateTime.UtcNow;
                workflow.UpdatedAt = DateTime.UtcNow;

                var highestOutputStep = HydrateWorkflowFromSnapshot(workflow, snapshot.OutputsJson);
                workflow.CurrentStep = Math.Clamp(snapshot.CurrentStep > 0 ? snapshot.CurrentStep : highestOutputStep, 1, TotalSteps);
                if (highestOutputStep > workflow.CurrentStep) workflow.CurrentStep = highestOutputStep;
                workflow.CurrentAccessibleStep = highestOutputStep;
                workflow.LastCompletedStep = highestOutputStep;

                await _unitOfWork.Repository<TWorkflow>().AddAsync(workflow);
                await _unitOfWork.SaveChangesAsync(ct);

                var (canStart, canResumeCurrent, canStartNew, currentRunCreatedAt) = await ComputeActionAvailabilityAsync(caseId, lawyerId, ct);

                var dto = new Dtos.Workflows.WorkflowStartNewResponseDto(
                    workflow.Id,
                    workflow.RunId,
                    workflow.CaseId,
                    GetWorkflowTypeName(),
                    workflow.Status.ToString(),
                    workflow.CurrentAccessibleStep,
                    workflow.LastCompletedStep,
                    false,
                    workflow.CreatedAt,
                    workflow.UpdatedAt,
                    canStart,
                    canResumeCurrent,
                    canStartNew,
                    currentRunCreatedAt
                );

                return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Success(dto, "تم استعادة النسخة كإصدار قابل للتعديل");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting workflow from snapshot {SnapshotId} for Case {CaseId}", snapshotId, caseId);
                return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء استعادة النسخة");
            }
        }

        private async Task<string> ResolveCanonicalSnapshotLawyerIdAsync(Guid caseId, string fallbackLawyerId, CancellationToken ct)
        {
            var caseEntity = await _unitOfWork.Repository<Case>().FirstOrDefaultAsync(x => x.Id == caseId, ct);
            return caseEntity?.LawyerId.ToString() ?? fallbackLawyerId;
        }

        private async Task<bool> SnapshotBelongsToRequesterAsync(WorkflowSnapshot snapshot, string lawyerId, CancellationToken ct)
        {
            if (string.Equals(snapshot.LawyerId, lawyerId, StringComparison.OrdinalIgnoreCase)) return true;
            if (!Guid.TryParse(lawyerId, out var parsedLawyerId)) return false;

            var lawyer = await _unitOfWork.Repository<Lawyer.Core.Models.Lawyer>()
                .FirstOrDefaultAsync(x => x.ApplicationUserId == parsedLawyerId || x.Id == parsedLawyerId, ct);
            if (lawyer == null) return false;

            return string.Equals(snapshot.LawyerId, lawyer.Id.ToString(), StringComparison.OrdinalIgnoreCase)
                || string.Equals(snapshot.LawyerId, lawyer.ApplicationUserId.ToString(), StringComparison.OrdinalIgnoreCase);
        }

        private int HydrateWorkflowFromSnapshot(TWorkflow workflow, string outputsJson)
        {
            if (string.IsNullOrWhiteSpace(outputsJson)) return 0;

            using var doc = JsonDocument.Parse(outputsJson);
            if (doc.RootElement.ValueKind != JsonValueKind.Object) return 0;

            var highestOutputStep = 0;
            foreach (var property in doc.RootElement.EnumerateObject())
            {
                if (!int.TryParse(property.Name, out var step) || step < 1 || step > TotalSteps) continue;

                var value = property.Value.ValueKind == JsonValueKind.String
                    ? property.Value.GetString()
                    : property.Value.GetRawText();
                if (string.IsNullOrWhiteSpace(value)) continue;

                workflow.SetStepOutput(step, value);
                highestOutputStep = Math.Max(highestOutputStep, step);
            }

            return highestOutputStep;
        }

        public virtual async Task<Result<TDto>> ResumeCurrentRunAsync(Guid caseId, string lawyerId, CancellationToken ct)
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

                var activeWorkflows = await _unitOfWork.Repository<TWorkflow>()
                    .WhereAsync(x => x.CaseId == caseId && x.LawyerId == lawyerId && x.Status == WorkflowStatus.InProgress, ct);

                TWorkflow workflow;

                if (activeWorkflows.Any())
                {
                    workflow = activeWorkflows.OrderByDescending(w => w.UpdatedAt).First();
                }
                else
                {
                    var completedWorkflows = await _unitOfWork.Repository<TWorkflow>()
                        .WhereAsync(x => x.CaseId == caseId && x.LawyerId == lawyerId && x.Status == WorkflowStatus.Completed, ct);

                    if (completedWorkflows.Any())
                    {
                        workflow = completedWorkflows.OrderByDescending(w => w.UpdatedAt).First();
                        var dto = MapToDto(workflow);
                        ApplyActionAvailability(dto, false, true, true, workflow.CreatedAt);
                        return Result<TDto>.Success(dto, "تم استئناف سير العمل المكتمل");
                    }

                    workflow = CreateNewWorkflow(caseId, lawyerId);
                    workflow.RunId = Guid.NewGuid().ToString();
                    workflow.CurrentStep = 1;
                    workflow.CurrentAccessibleStep = 0;
                    workflow.LastCompletedStep = 0;
                    workflow.Status = WorkflowStatus.InProgress;
                    workflow.CreatedAt = DateTime.UtcNow;
                    workflow.UpdatedAt = DateTime.UtcNow;

                    await _unitOfWork.Repository<TWorkflow>().AddAsync(workflow);
                    await _unitOfWork.SaveChangesAsync(ct);

                    _logger.LogInformation("ResumeCurrentRun created new workflow {RunId} for Case {CaseId}", workflow.RunId, caseId);
                }

                var result = MapToDto(workflow);
                var (canStart, canResumeCurrent, canStartNew, currentRunCreatedAt) = await ComputeActionAvailabilityAsync(caseId, lawyerId, ct);
                ApplyActionAvailability(result, canStart, canResumeCurrent, canStartNew, currentRunCreatedAt);
                return Result<TDto>.Success(result, "تم استئناف سير العمل بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resuming current run for Case {CaseId}", caseId);
                return Result<TDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء استئناف سير العمل");
            }
        }

        public virtual async Task<Result<TDto>> AdvanceStageAsync(Guid caseId, int workflowId, int fromStep, int toStep, string lawyerId, CancellationToken ct)
        {
            try
            {
                var workflow = await _unitOfWork.Repository<TWorkflow>().FirstOrDefaultAsync(x => x.Id == workflowId, ct);
                if (workflow == null) return Result<TDto>.Error(HttpStatusCode.NotFound, "سير العمل غير موجود");
                if (workflow.LawyerId != lawyerId) return Result<TDto>.Error(HttpStatusCode.Forbidden, "ليس لديك صلاحية");

                if (toStep <= workflow.CurrentAccessibleStep)
                {
                    return Result<TDto>.Success(MapToDto(workflow), "تم الانتقال إلى المرحلة التالية بنجاح");
                }

                if (workflow.Status != WorkflowStatus.InProgress) return Result<TDto>.Error(HttpStatusCode.BadRequest, "سير العمل ليس قيد التقدم");
                if (fromStep < 1 || fromStep > TotalSteps) return Result<TDto>.Error(HttpStatusCode.BadRequest, "رقم خطوة غير صالح");
                if (toStep != fromStep + 1) return Result<TDto>.Error(HttpStatusCode.BadRequest, "يمكن الانتقال خطوة واحدة فقط");
                if (workflow.LastCompletedStep < fromStep) return Result<TDto>.Error(HttpStatusCode.BadRequest, "الخطوة المحددة لم تكتمل بعد");
                if (toStep < 1 || toStep > TotalSteps) return Result<TDto>.Error(HttpStatusCode.BadRequest, "رقم خطوة غير صالح");

                workflow.CurrentAccessibleStep = toStep;
                workflow.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.Repository<TWorkflow>().Update(workflow);
                await _unitOfWork.SaveChangesAsync(ct);

                return Result<TDto>.Success(MapToDto(workflow), "تم الانتقال إلى المرحلة التالية بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error advancing stage for workflow {WorkflowId}", workflowId);
                return Result<TDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء الانتقال إلى المرحلة التالية");
            }
        }
        public abstract Task<Result<WorkflowStageConflictResponseDto>> RecoverConflictAsync(Guid caseId, int workflowId, int stepNumber, string lawyerId, CancellationToken ct);

        public virtual async Task<Result<WorkflowStageConflictResponseDto>> RecoverConflictBaseAsync(Guid caseId, int workflowId, int stepNumber, string lawyerId, CancellationToken ct)
        {
            try
            {
                var workflow = await _unitOfWork.Repository<TWorkflow>().FirstOrDefaultAsync(x => x.Id == workflowId, ct);
                if (workflow == null) return Result<WorkflowStageConflictResponseDto>.Error(HttpStatusCode.NotFound, "سير العمل غير موجود");
                if (workflow.LawyerId != lawyerId) return Result<WorkflowStageConflictResponseDto>.Error(HttpStatusCode.Forbidden, "ليس لديك صلاحية");

                workflow.ConflictStepMetadata = null;
                workflow.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Repository<TWorkflow>().Update(workflow);
                await _unitOfWork.SaveChangesAsync(ct);

                var response = new WorkflowStageConflictResponseDto(
                    Guid.NewGuid().ToString(),
                    stepNumber,
                    "Recovered",
                    "تم استعادة التعارض بنجاح",
                    new List<string>(),
                    DateTime.UtcNow
                );

                return Result<WorkflowStageConflictResponseDto>.Success(response, "تم استعادة التعارض بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recovering conflict for workflow {WorkflowId}", workflowId);
                return Result<WorkflowStageConflictResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء استعادة التعارض");
            }
        }

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
                workflow.RunId = Guid.NewGuid().ToString();
                workflow.CurrentStep = 1;
                workflow.CurrentAccessibleStep = 0;
                workflow.LastCompletedStep = 0;
                workflow.Status = WorkflowStatus.InProgress;
                workflow.CreatedAt = DateTime.UtcNow;
                workflow.UpdatedAt = DateTime.UtcNow;
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

                var dto = MapToDto(workflow);
                var (canStart, canResumeCurrent, canStartNew, currentRunCreatedAt) = await ComputeActionAvailabilityAsync(workflow.CaseId, lawyerId, ct);
                ApplyActionAvailability(dto, canStart, canResumeCurrent, canStartNew, currentRunCreatedAt);
                return Result<TDto>.Success(dto);
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
                        LawyerId = await ResolveCanonicalSnapshotLawyerIdAsync(workflow.CaseId, lawyerId, ct),
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
                var aiResult = await _aiProviderFactory.GetProvider().SendChatCompletionAsync(
                    systemPrompt,
                    userPrompt,
                    AIRequestOptions.ForAnalysis with { Model = model, StepType = stepType },
                    ct);

                if (!aiResult.Succeeded || aiResult.Data == null || string.IsNullOrWhiteSpace(aiResult.Data.Content)) return Result<object>.Error(HttpStatusCode.InternalServerError, $"فشل في تنفيذ الخطوة {stepNumber}");

                var cleanedJson = CleanJsonResponse(aiResult.Data.Content);

                await _trackingService.RecordGeminiUsageAsync(
                    Guid.Parse(lawyerId),
                    workflow.CaseId,
                    stepType,
                    model ?? "",
                    aiResult.Data.Usage,
                    CancellationToken.None,
                    workflow.Id,
                    workflow.RunId,
                    GetWorkflowTypeName());

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

                workflow.LastCompletedStep = Math.Max(workflow.LastCompletedStep, stepNumber);
                workflow.CurrentStep = Math.Max(workflow.CurrentStep, Math.Min(stepNumber + 1, TotalSteps));

                if (stepNumber == TotalSteps)
                {
                    workflow.Status = WorkflowStatus.Completed;
                }

                await _unitOfWork.Repository<TWorkflow>().Update(workflow);
                await _unitOfWork.SaveChangesAsync(ct);

                return Result<object>.Success(new { stepNumber, output = cleanedJson, workflow.CurrentStep, workflow.CurrentAccessibleStep, workflow.LastCompletedStep, workflow.Status });
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

        protected void ApplyActionAvailability(TDto dto, bool canStart, bool canResumeCurrent, bool canStartNew, DateTime? currentRunCreatedAt)
        {
            var type = dto!.GetType();
            type.GetProperty("CanStart")?.SetValue(dto, canStart);
            type.GetProperty("CanResumeCurrent")?.SetValue(dto, canResumeCurrent);
            type.GetProperty("CanStartNew")?.SetValue(dto, canStartNew);
            type.GetProperty("CurrentRunCreatedAt")?.SetValue(dto, currentRunCreatedAt);
        }

        protected async Task<(bool CanStart, bool CanResumeCurrent, bool CanStartNew, DateTime? CurrentRunCreatedAt)> ComputeActionAvailabilityAsync(Guid caseId, string lawyerId, CancellationToken ct)
        {
            var allWorkflows = await _unitOfWork.Repository<TWorkflow>()
                .WhereAsync(x => x.CaseId == caseId && x.LawyerId == lawyerId, ct);

            var inProgress = allWorkflows.Where(x => x.Status == WorkflowStatus.InProgress).ToList();
            var anyRun = allWorkflows.Any();

            var canStart = !inProgress.Any();
            var canResumeCurrent = inProgress.Any();
            var canStartNew = anyRun;
            DateTime? currentRunCreatedAt = inProgress.Any()
                ? inProgress.OrderByDescending(w => w.UpdatedAt).First().CreatedAt
                : null;

            return (canStart, canResumeCurrent, canStartNew, currentRunCreatedAt);
        }

        protected virtual string BuildStepSpecificUserPrompt(TWorkflow workflow, Case caseEntity, int stepNumber, string? input)
        {
            var caseContext = BuildCaseContext(caseEntity, caseEntity.CaseType?.Title);
            var previousSteps = BuildPreviousStepsContext(workflow, stepNumber);
            return $"--- بيانات القضية الكاملة ---\n{caseContext}\n\n--- نواتج المراحل السابقة ---\n{previousSteps}\n\n--- مدخلات إضافية ---\n{(string.IsNullOrWhiteSpace(input) ? "لا يوجد" : input)}";
        }
    }
}
