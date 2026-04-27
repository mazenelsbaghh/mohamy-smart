using Lawyer.Application.Dtos.ExecRequest;
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
using Lawyer.Application.Services.Workflows;
using Lawyer.Application.Common;

namespace Lawyer.Application.Services
{
    public class ExecRequestService : WorkflowServiceBase<ExecRequestWorkflow, ExecRequestWorkflowDto>, IExecRequestService
    {
        private string? _executiveTitleType;

        public ExecRequestService(
            IUnitOfWork unitOfWork,
            ILogger<ExecRequestService> logger,
            IAIProviderFactory aiProviderFactory,
            IConfiguration config,
            ICaseAccessValidator caseAccessValidator,
            IAiUsageTrackingService trackingService,
            PromptTemplateCache promptCache)
            : base(unitOfWork, logger, aiProviderFactory, config, caseAccessValidator, trackingService, promptCache)
        {
        }

        protected override int TotalSteps => 3;
        protected override string GetPromptFolderName() => "المرحلة السابعة طلبات التنفيذ";
        protected override string GetStepFileName(int step) => step switch
        {
            1 => "exec-step1-classification.txt",
            2 => "exec-step2-drafting.txt",
            3 => "exec-step3-assembly.txt",
            _ => throw new ArgumentOutOfRangeException(nameof(step), "رقم خطوة غير صالح")
        };
        protected override AiStepType GetStepType(int step) => step switch
        {
            1 => AiStepType.ExecRequestClassification,
            2 => AiStepType.ExecRequestDrafting,
            3 => AiStepType.ExecRequestAssembly,
            _ => throw new ArgumentOutOfRangeException(nameof(step), "رقم خطوة غير صالح")
        };
        protected override ExecRequestWorkflow CreateNewWorkflow(Guid caseId, string lawyerId) => new()
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            ExecutiveTitleType = _executiveTitleType ?? "judicial",
            CurrentStep = 1,
            Status = WorkflowStatus.InProgress
        };
        protected override ExecRequestWorkflowDto MapToDto(ExecRequestWorkflow w) => new()
        {
            Id = w.Id,
            CaseId = w.CaseId,
            LawyerId = w.LawyerId,
            ExecutiveTitleType = w.ExecutiveTitleType,
            CurrentStep = w.CurrentStep,
            Status = w.Status.ToString(),
            Step1Output = w.Step1Output,
            Step2Output = w.Step2Output,
            Step3Output = w.Step3Output,
            CreatedAt = w.CreatedAt
        };
        protected override string BuildPreviousStepsContext(ExecRequestWorkflow workflow, int currentStep)
        {
            var sb = new System.Text.StringBuilder();
            if (currentStep > 1 && !string.IsNullOrWhiteSpace(workflow.Step1Output))
                sb.AppendLine($"--- ناتج الخطوة 1 (تصنيف طلب التنفيذ ونوع السند التنفيذي) ---\n{workflow.Step1Output}\n");
            if (currentStep > 2 && !string.IsNullOrWhiteSpace(workflow.Step2Output))
                sb.AppendLine($"--- ناتج الخطوة 2 (مسودة طلب التنفيذ — النص والأساس القانوني) ---\n{workflow.Step2Output}\n");
            return sb.ToString();
        }

        protected override string GetWorkflowTypeName() => "exec-request";

        protected override string BuildStepSpecificUserPrompt(ExecRequestWorkflow workflow, Case caseEntity, int stepNumber, string? input)
        {
            var caseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseEntity.CaseType?.Title);
            var previousSteps = BuildPreviousStepsContext(workflow, stepNumber);
            var executiveTypeContext = $"نوع السند التنفيذي: {workflow.ExecutiveTitleType}";
            return $"--- بيانات القضية الكاملة ---\n{caseContext}\n\n--- نوع السند التنفيذي ---\n{executiveTypeContext}\n\n--- نواتج المراحل السابقة ---\n{previousSteps}\n\n--- مدخلات إضافية ---\n{(string.IsNullOrWhiteSpace(input) ? "لا يوجد" : input)}";
        }

        public Task<Result<ExecRequestWorkflowDto>> StartWorkflowAsync(StartExecRequestRequest request, string lawyerId, CancellationToken ct)
        {
            _executiveTitleType = string.IsNullOrWhiteSpace(request.ExecutiveTitleType) ? "judicial" : request.ExecutiveTitleType;
            return StartWorkflowBaseAsync(request.CaseId, lawyerId, ct);
        }

        public Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunExecStepRequest request, string lawyerId, CancellationToken ct)
            => RunStepBaseAsync(workflowId, stepNumber, request.Input, lawyerId, ct);
    }
}
