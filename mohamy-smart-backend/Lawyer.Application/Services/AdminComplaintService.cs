using Lawyer.Application.Common;
using Lawyer.Application.Dtos.AdminComplaint;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Core.Enum;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Lawyer.Core.Exceptions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using Lawyer.Application.Dtos.Workflows;
using Lawyer.Application.Services.Workflows;

namespace Lawyer.Application.Services
{
    public class AdminComplaintService : WorkflowServiceBase<AdminComplaintWorkflow, AdminComplaintWorkflowDto>, IAdminComplaintService
    {
        public AdminComplaintService(
            IUnitOfWork unitOfWork,
            ILogger<AdminComplaintService> logger,
            IAIProviderFactory aiProviderFactory,
            IConfiguration config,
            ICaseAccessValidator caseAccessValidator,
            IAiUsageTrackingService trackingService,
            PromptTemplateCache promptCache)
            : base(unitOfWork, logger, aiProviderFactory, config, caseAccessValidator, trackingService, promptCache)
        {
        }

        protected override int TotalSteps => 5;
        protected override string GetPromptFolderName() => "المرحلة الرابعة إعداد شكاوى أو تظلمات إدارية";
        protected override string GetStepFileName(int step) => step switch
        {
            1 => "admin-step1-classification.txt",
            2 => "admin-step2-facts.txt",
            3 => "admin-step3-violation.txt",
            4 => "admin-step4-requests.txt",
            5 => "admin-step5-final.txt",
            _ => throw new ArgumentOutOfRangeException(nameof(step), "رقم خطوة غير صالح")
        };
        protected override AiStepType GetStepType(int step) => step switch
        {
            1 => AiStepType.AdminComplaintClassification,
            2 => AiStepType.AdminComplaintFacts,
            3 => AiStepType.AdminComplaintViolation,
            4 => AiStepType.AdminComplaintRequests,
            5 => AiStepType.AdminComplaintAssembly,
            _ => throw new ArgumentOutOfRangeException(nameof(step), "رقم خطوة غير صالح")
        };
        protected override AdminComplaintWorkflow CreateNewWorkflow(Guid caseId, string lawyerId) => new()
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CurrentStep = 1,
            Status = WorkflowStatus.InProgress
        };
        protected override AdminComplaintWorkflowDto MapToDto(AdminComplaintWorkflow w) => new()
        {
            Id = w.Id,
            CaseId = w.CaseId,
            LawyerId = w.LawyerId,
            CurrentStep = w.CurrentStep,
            Status = w.Status.ToString(),
            Step1Output = w.Step1Output,
            Step2Output = w.Step2Output,
            Step3Output = w.Step3Output,
            Step4Output = w.Step4Output,
            Step5Output = w.Step5Output,
            CreatedAt = w.CreatedAt,
            UpdatedAt = w.UpdatedAt,
            RunId = w.RunId,
            CurrentAccessibleStep = w.CurrentAccessibleStep,
            LastCompletedStep = w.LastCompletedStep,
            IsReadOnly = w.Status != WorkflowStatus.InProgress
        };
        protected override string BuildPreviousStepsContext(AdminComplaintWorkflow workflow, int currentStep)
        {
            var sb = new System.Text.StringBuilder();
            if (currentStep > 1 && !string.IsNullOrWhiteSpace(workflow.Step1Output))
                sb.AppendLine($"--- ناتج الخطوة 1 (بيانات الجهة والأساس) ---\n{workflow.Step1Output}\n");
            if (currentStep > 2 && !string.IsNullOrWhiteSpace(workflow.Step2Output))
                sb.AppendLine($"--- ناتج الخطوة 2 (صياغة الوقائع) ---\n{workflow.Step2Output}\n");
            if (currentStep > 3 && !string.IsNullOrWhiteSpace(workflow.Step3Output))
                sb.AppendLine($"--- ناتج الخطوة 3 (تحليل المخالفات) ---\n{workflow.Step3Output}\n");
            if (currentStep > 4 && !string.IsNullOrWhiteSpace(workflow.Step4Output))
                sb.AppendLine($"--- ناتج الخطوة 4 (الطلبات) ---\n{workflow.Step4Output}\n");
            return sb.ToString().Trim();
        }
        protected override string GetWorkflowTypeName() => "admin-complaint";

        public Task<Result<AdminComplaintWorkflowDto>> StartWorkflowAsync(StartComplaintWorkflowRequest request, string lawyerId, CancellationToken ct)
            => StartWorkflowBaseAsync(request.CaseId, lawyerId, ct);

        public Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunComplaintStepRequest request, string lawyerId, CancellationToken ct)
            => RunStepBaseAsync(workflowId, stepNumber, request.Input, lawyerId, ct);

        public override Task<Result<AdminComplaintWorkflowDto>> ResumeCurrentRunAsync(Guid caseId, string lawyerId, CancellationToken ct)
            => base.ResumeCurrentRunAsync(caseId, lawyerId, ct);
        public override Task<Result<AdminComplaintWorkflowDto>> AdvanceStageAsync(Guid caseId, int workflowId, int fromStep, int toStep, string lawyerId, CancellationToken ct)
            => base.AdvanceStageAsync(caseId, workflowId, fromStep, toStep, lawyerId, ct);
        public override Task<Result<WorkflowStageConflictResponseDto>> RecoverConflictAsync(Guid caseId, int workflowId, int stepNumber, string lawyerId, CancellationToken ct)
            => RecoverConflictBaseAsync(caseId, workflowId, stepNumber, lawyerId, ct);
    }
}
