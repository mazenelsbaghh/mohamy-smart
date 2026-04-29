using Lawyer.Application.Common;
using Lawyer.Application.Dtos.LegalWarning;
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
    public class LegalWarningService : WorkflowServiceBase<LegalWarningWorkflow, LegalWarningWorkflowDto>, ILegalWarningService
    {
        public LegalWarningService(
            IUnitOfWork unitOfWork,
            ILogger<LegalWarningService> logger,
            IAIProviderFactory aiProviderFactory,
            IConfiguration config,
            ICaseAccessValidator caseAccessValidator,
            IAiUsageTrackingService trackingService,
            PromptTemplateCache promptCache)
            : base(unitOfWork, logger, aiProviderFactory, config, caseAccessValidator, trackingService, promptCache)
        {
        }

        protected override int TotalSteps => 3;
        protected override string GetPromptFolderName() => "المرحلة السادسة تجهيز الإنذار الرسمي أو الإعذار القضائي";
        protected override string GetStepFileName(int step) => step switch
        {
            1 => "warning-step1-classification.txt",
            2 => "warning-step2-body.txt",
            3 => "warning-step3-assembly.txt",
            _ => throw new ArgumentOutOfRangeException(nameof(step), "رقم خطوة غير صالح")
        };
        protected override AiStepType GetStepType(int step) => step switch
        {
            1 => AiStepType.LegalWarningClassification,
            2 => AiStepType.LegalWarningBodyDraft,
            3 => AiStepType.LegalWarningAssembly,
            _ => throw new ArgumentOutOfRangeException(nameof(step), "رقم خطوة غير صالح")
        };
        protected override LegalWarningWorkflow CreateNewWorkflow(Guid caseId, string lawyerId) => new()
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CurrentStep = 1,
            Status = WorkflowStatus.InProgress
        };
        protected override LegalWarningWorkflowDto MapToDto(LegalWarningWorkflow w) => new()
        {
            Id = w.Id,
            CaseId = w.CaseId,
            LawyerId = w.LawyerId,
            CurrentStep = w.CurrentStep,
            Status = w.Status.ToString(),
            Step1Output = w.Step1Output,
            Step2Output = w.Step2Output,
            Step3Output = w.Step3Output,
            CreatedAt = w.CreatedAt,
            UpdatedAt = w.UpdatedAt,
            RunId = w.RunId,
            CurrentAccessibleStep = w.CurrentAccessibleStep,
            LastCompletedStep = w.LastCompletedStep,
            IsReadOnly = w.Status != WorkflowStatus.InProgress
        };
        protected override string BuildPreviousStepsContext(LegalWarningWorkflow workflow, int currentStep)
        {
            var sb = new System.Text.StringBuilder();
            if (currentStep > 1 && !string.IsNullOrWhiteSpace(workflow.Step1Output))
                sb.AppendLine($"--- ناتج الخطوة 1 (التصنيف) ---\n{workflow.Step1Output}\n");
            if (currentStep > 2 && !string.IsNullOrWhiteSpace(workflow.Step2Output))
                sb.AppendLine($"--- ناتج الخطوة 2 (مسودة الإنذار) ---\n{workflow.Step2Output}\n");
            return sb.ToString();
        }
        protected override string GetWorkflowTypeName() => "legal-warning";

        public Task<Result<LegalWarningWorkflowDto>> StartWorkflowAsync(StartLegalWarningRequest request, string lawyerId, CancellationToken ct)
            => StartWorkflowBaseAsync(request.CaseId, lawyerId, ct);

        public Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunWarningStepRequest request, string lawyerId, CancellationToken ct)
            => RunStepBaseAsync(workflowId, stepNumber, request.Input, lawyerId, ct);

        public override Task<Result<LegalWarningWorkflowDto>> ResumeCurrentRunAsync(Guid caseId, string lawyerId, CancellationToken ct)
            => base.ResumeCurrentRunAsync(caseId, lawyerId, ct);
        public override Task<Result<LegalWarningWorkflowDto>> AdvanceStageAsync(Guid caseId, int workflowId, int fromStep, int toStep, string lawyerId, CancellationToken ct)
            => base.AdvanceStageAsync(caseId, workflowId, fromStep, toStep, lawyerId, ct);
        public override Task<Result<WorkflowStageConflictResponseDto>> RecoverConflictAsync(Guid caseId, int workflowId, int stepNumber, string lawyerId, CancellationToken ct)
            => RecoverConflictBaseAsync(caseId, workflowId, stepNumber, lawyerId, ct);
    }
}
