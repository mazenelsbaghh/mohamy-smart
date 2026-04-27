using Lawyer.Application.Dtos.AppealBrief;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Lawyer.Application.Services.Workflows;
using Lawyer.Application.Common;

namespace Lawyer.Application.Services
{
    public class AppealBriefService : WorkflowServiceBase<AppealWorkflow, AppealWorkflowDto>, IAppealBriefService
    {
        public AppealBriefService(
            IUnitOfWork unitOfWork,
            ILogger<AppealBriefService> logger,
            IAIProviderFactory aiProviderFactory,
            IConfiguration config,
            ICaseAccessValidator caseAccessValidator,
            IAiUsageTrackingService trackingService,
            PromptTemplateCache promptCache)
            : base(unitOfWork, logger, aiProviderFactory, config, caseAccessValidator, trackingService, promptCache)
        {
        }

        protected override int TotalSteps => 6;
        protected override string GetPromptFolderName() => "المرحلة الثالثة إعداد صحيفة طعن";

        protected override string GetStepFileName(int step) => step switch
        {
            1 => "appeal-step1-judgment-data.txt",
            2 => "appeal-step2-analysis.txt",
            3 => "appeal-step3-grounds.txt",
            4 => "appeal-step4-requests.txt",
            5 => "appeal-step5-legal-basis.txt",
            6 => "appeal-step6-full-appeal.txt",
            _ => throw new ArgumentOutOfRangeException(nameof(step))
        };

        protected override AiStepType GetStepType(int step) => step switch
        {
            1 => AiStepType.AppealBriefJudgmentData,
            2 => AiStepType.AppealBriefReasoningAnalysis,
            3 => AiStepType.AppealBriefGrounds,
            4 => AiStepType.AppealBriefRequests,
            5 => AiStepType.AppealBriefLegalBasis,
            6 => AiStepType.AppealBriefAssembly,
            _ => throw new ArgumentOutOfRangeException(nameof(step))
        };

        protected override AppealWorkflow CreateNewWorkflow(Guid caseId, string lawyerId) =>
            new AppealWorkflow { CaseId = caseId, LawyerId = lawyerId };

        protected override AppealWorkflowDto MapToDto(AppealWorkflow w) => new()
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
            Step6Output = w.Step6Output,
            CreatedAt = w.CreatedAt
        };

        protected override string BuildPreviousStepsContext(AppealWorkflow workflow, int currentStep)
        {
            var sb = new System.Text.StringBuilder();
            if (currentStep > 1 && !string.IsNullOrWhiteSpace(workflow.Step1Output))
                sb.AppendLine($"--- ناتج الخطوة 1 (بيانات الحكم المطعون فيه ومواعيد الطعن) ---\n{workflow.Step1Output}\n");
            if (currentStep > 2 && !string.IsNullOrWhiteSpace(workflow.Step2Output))
                sb.AppendLine($"--- ناتج الخطوة 2 (تحليل أسباب الحكم — المنطق القضائي والأدلة) ---\n{workflow.Step2Output}\n");
            if (currentStep > 3 && !string.IsNullOrWhiteSpace(workflow.Step3Output))
                sb.AppendLine($"--- ناتج الخطوة 3 (أوجه الطعن المحددة) ---\n{workflow.Step3Output}\n");
            if (currentStep > 4 && !string.IsNullOrWhiteSpace(workflow.Step4Output))
                sb.AppendLine($"--- ناتج الخطوة 4 (الطلبات المحددة في صحيفة الطعن) ---\n{workflow.Step4Output}\n");
            if (currentStep > 5 && !string.IsNullOrWhiteSpace(workflow.Step5Output))
                sb.AppendLine($"--- ناتج الخطوة 5 (الأساس القانوني — النصوص والأحكام القضائية) ---\n{workflow.Step5Output}\n");
            return sb.ToString();
        }

        protected override string GetWorkflowTypeName() => "appeal-brief";

        protected override string BuildStepSpecificUserPrompt(AppealWorkflow workflow, Case caseEntity, int stepNumber, string? input)
        {
            // Always include full case context so the AI is aware of all case data (OCR, facts, law, etc.)
            var caseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseEntity.CaseType?.Title);
            var previousSteps = BuildPreviousStepsContext(workflow, stepNumber);

            string stepSpecificContent;
            if (stepNumber == 1)
            {
                stepSpecificContent = ExtractAdditionalInput(input);
            }
            else if (stepNumber == 5)
            {
                stepSpecificContent = $"أوجه الطعن:\n{workflow.Step3Output}\n\nالطلبات:\n{workflow.Step4Output}";
            }
            else if (stepNumber == 6)
            {
                var dict = new Dictionary<string, string?>
                {
                    { "step1", workflow.Step1Output },
                    { "step2", workflow.Step2Output },
                    { "step3", workflow.Step3Output },
                    { "step4", workflow.Step4Output },
                    { "step5", workflow.Step5Output }
                };
                stepSpecificContent = JsonSerializer.Serialize(dict, Common.JsonOptions.Serialize);
            }
            else
            {
                stepSpecificContent = workflow.GetStepOutput(stepNumber - 1) ?? string.Empty;
            }

            return $"--- بيانات القضية الكاملة ---\n{caseContext}\n\n--- نواتج المراحل السابقة ---\n{previousSteps}\n\n--- مدخلات المرحلة الحالية ---\n{stepSpecificContent}";
        }

        private static string ExtractAdditionalInput(string? input)
        {
            if (string.IsNullOrWhiteSpace(input)) return string.Empty;
            var trimmedInput = input.Trim();
            try
            {
                using var document = JsonDocument.Parse(trimmedInput);
                if (document.RootElement.ValueKind == JsonValueKind.Object)
                {
                    foreach (var propertyName in new[] { "input", "facts", "description", "details" })
                    {
                        if (document.RootElement.TryGetProperty(propertyName, out var property) &&
                            property.ValueKind == JsonValueKind.String &&
                            !string.IsNullOrWhiteSpace(property.GetString()))
                        {
                            return property.GetString()!;
                        }
                    }
                }
            }
            catch { }
            return trimmedInput;
        }

        public Task<Result<AppealWorkflowDto>> StartWorkflowAsync(StartAppealWorkflowRequest request, string lawyerId, CancellationToken ct) =>
            StartWorkflowBaseAsync(request.CaseId, lawyerId, ct);

        public Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunStepRequest request, string lawyerId, CancellationToken ct) =>
            RunStepBaseAsync(workflowId, stepNumber, request.Input!, lawyerId, ct);
    }
}
