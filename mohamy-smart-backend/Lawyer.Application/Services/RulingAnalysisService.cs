using Lawyer.Application.Common;
using Lawyer.Application.Dtos.RulingAnalysis;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using Lawyer.Application.Dtos.Workflows;
using Lawyer.Application.Services.Workflows;

namespace Lawyer.Application.Services
{
    public class RulingAnalysisService : WorkflowServiceBase<RulingAnalysisWorkflow, RulingAnalysisWorkflowDto>, IRulingAnalysisService
    {
        public RulingAnalysisService(
            IUnitOfWork unitOfWork,
            ILogger<RulingAnalysisService> logger,
            IAIProviderFactory aiProviderFactory,
            IConfiguration config,
            ICaseAccessValidator caseAccessValidator,
            IAiUsageTrackingService trackingService,
            PromptTemplateCache promptCache)
            : base(unitOfWork, logger, aiProviderFactory, config, caseAccessValidator, trackingService, promptCache)
        {
        }

        protected override int TotalSteps => 4;
        protected override string GetPromptFolderName() => "المرحلة الخامسة تحليل حكم قضائي صادر";
        protected override string GetStepFileName(int step) => step switch
        {
            1 => "ruling-step1-operative.txt",
            2 => "ruling-step2-reasoning.txt",
            3 => "ruling-step3-evaluation.txt",
            4 => "ruling-step4-report.txt",
            _ => throw new ArgumentOutOfRangeException(nameof(step), "رقم خطوة غير صالح")
        };
        protected override AiStepType GetStepType(int step) => step switch
        {
            1 => AiStepType.RulingAnalysisOperative,
            2 => AiStepType.RulingAnalysisReasoning,
            3 => AiStepType.RulingAnalysisDefectEvaluation,
            4 => AiStepType.RulingAnalysisFeasibilityReport,
            _ => throw new ArgumentOutOfRangeException(nameof(step), "رقم خطوة غير صالح")
        };
        protected override RulingAnalysisWorkflow CreateNewWorkflow(Guid caseId, string lawyerId) => new()
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CurrentStep = 1,
            Status = WorkflowStatus.InProgress
        };
        protected override RulingAnalysisWorkflowDto MapToDto(RulingAnalysisWorkflow w) => new()
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
            CreatedAt = w.CreatedAt,
            UpdatedAt = w.UpdatedAt,
            RunId = w.RunId,
            CurrentAccessibleStep = w.CurrentAccessibleStep,
            LastCompletedStep = w.LastCompletedStep,
            IsReadOnly = w.Status != WorkflowStatus.InProgress
        };
        protected override string BuildPreviousStepsContext(RulingAnalysisWorkflow workflow, int currentStep)
        {
            var sb = new System.Text.StringBuilder();
            if (currentStep > 1 && !string.IsNullOrWhiteSpace(workflow.Step1Output))
                sb.AppendLine($"--- ناتج الخطوة 1 (تحليل منطوق الحكم — التهم والنقاط المقضي بها) ---\n{workflow.Step1Output}\n");
            if (currentStep > 2 && !string.IsNullOrWhiteSpace(workflow.Step2Output))
                sb.AppendLine($"--- ناتج الخطوة 2 (تحليل أسباب الحكم — المنطق القضائي والأدلة المستند إليها) ---\n{workflow.Step2Output}\n");
            if (currentStep > 3 && !string.IsNullOrWhiteSpace(workflow.Step3Output))
                sb.AppendLine($"--- ناتج الخطوة 3 (تقييم عيوب الحكم — نوع العيب ودرجة جسامته) ---\n{workflow.Step3Output}\n");
            return sb.ToString();
        }

        protected override string GetWorkflowTypeName() => "ruling-analysis";

        public Task<Result<RulingAnalysisWorkflowDto>> StartWorkflowAsync(StartRulingWorkflowRequest request, string lawyerId, CancellationToken ct)
            => StartWorkflowBaseAsync(request.CaseId, lawyerId, ct);

        public Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunRulingStepRequest request, string lawyerId, CancellationToken ct)
            => RunStepBaseAsync(workflowId, stepNumber, request.Input, lawyerId, ct);

        public override Task<Result<RulingAnalysisWorkflowDto>> ResumeCurrentRunAsync(Guid caseId, string lawyerId, CancellationToken ct)
            => base.ResumeCurrentRunAsync(caseId, lawyerId, ct);
        public override Task<Result<RulingAnalysisWorkflowDto>> AdvanceStageAsync(Guid caseId, int workflowId, int fromStep, int toStep, string lawyerId, CancellationToken ct)
            => base.AdvanceStageAsync(caseId, workflowId, fromStep, toStep, lawyerId, ct);
        public override Task<Result<WorkflowStageConflictResponseDto>> RecoverConflictAsync(Guid caseId, int workflowId, int stepNumber, string lawyerId, CancellationToken ct)
            => RecoverConflictBaseAsync(caseId, workflowId, stepNumber, lawyerId, ct);
    }
}
