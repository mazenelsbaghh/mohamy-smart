using System.Collections.Generic;
using System.Linq;
using Lawyer.Core.Models.Workflows;
using Lawyer.Core.Enum;

namespace Lawyer.Application.Services.Workflows
{
    public static class PipelineRegistry
    {
        private static readonly List<PipelineDefinition> _pipelines = new()
        {
            new PipelineDefinition { 
                Id = "smart-analysis", Name = "التحليل الذكي", TotalSteps = 5, CategoryOrder = 1,
                Steps = new() {
                    new PipelineStepDefinition { StepType = AiStepType.FactAnalysis, DisplayName = "تحليل الوقائع" },
                    new PipelineStepDefinition { StepType = AiStepType.GenerateDefenses, DisplayName = "توليد الدفوع" },
                    new PipelineStepDefinition { StepType = AiStepType.AnalysisDefense, DisplayName = "تحليل الدفاع" },
                    new PipelineStepDefinition { StepType = AiStepType.FinalRequirements, DisplayName = "الطلبات الختامية" },
                    new PipelineStepDefinition { StepType = AiStepType.DefenseMemoDraft, DisplayName = "تجميع مذكرة الدفاع" }
                }
            },
            new PipelineDefinition { 
                Id = "statement-of-claims", Name = "إعداد الدعوى", TotalSteps = 6, CategoryOrder = 2,
                Steps = new() {
                    new PipelineStepDefinition { StepType = AiStepType.LawsuitCaseType, DisplayName = "نوع القضية" },
                    new PipelineStepDefinition { StepType = AiStepType.LawsuitParties, DisplayName = "الأطراف" },
                    new PipelineStepDefinition { StepType = AiStepType.LawsuitSubjects, DisplayName = "الموضوعات" },
                    new PipelineStepDefinition { StepType = AiStepType.LawsuitFacts, DisplayName = "الوقائع" },
                    new PipelineStepDefinition { StepType = AiStepType.LawsuitLegalBasis, DisplayName = "السند القانوني" },
                    new PipelineStepDefinition { StepType = AiStepType.LawsuitRequests, DisplayName = "الطلبات" }
                }
            },
            new PipelineDefinition { 
                Id = "ocr", Name = "التعرف البصري", TotalSteps = 1, CategoryOrder = 3,
                Steps = new() { new PipelineStepDefinition { StepType = AiStepType.Ocr, DisplayName = "التعرف البصري" } }
            },
            new PipelineDefinition { 
                Id = "chat", Name = "المحادثة", TotalSteps = 1, CategoryOrder = 4,
                Steps = new() { new PipelineStepDefinition { StepType = AiStepType.Chat, DisplayName = "المحادثة" } }
            },
            new PipelineDefinition { 
                Id = "clarify-facts", Name = "التحقق التمهيدي", TotalSteps = 1, CategoryOrder = 5,
                Steps = new() { new PipelineStepDefinition { StepType = AiStepType.ClarifyFacts, DisplayName = "تقييم اكتمال الوقائع" } }
            },
            new PipelineDefinition { 
                Id = "appeal-brief", Name = "صحيفة الطعن", TotalSteps = 6, CategoryOrder = 6,
                Steps = new() {
                    new PipelineStepDefinition { StepType = AiStepType.AppealBriefJudgmentData, DisplayName = "استخراج بيانات الحكم" },
                    new PipelineStepDefinition { StepType = AiStepType.AppealBriefReasoningAnalysis, DisplayName = "تحليل أسباب الحكم" },
                    new PipelineStepDefinition { StepType = AiStepType.AppealBriefGrounds, DisplayName = "تحديد أوجه الطعن" },
                    new PipelineStepDefinition { StepType = AiStepType.AppealBriefRequests, DisplayName = "صياغة الطلبات" },
                    new PipelineStepDefinition { StepType = AiStepType.AppealBriefLegalBasis, DisplayName = "السند القانوني" },
                    new PipelineStepDefinition { StepType = AiStepType.AppealBriefAssembly, DisplayName = "تجميع الصحيفة النهائية" }
                }
            },
            new PipelineDefinition { 
                Id = "admin-complaint", Name = "الشكاوى الإدارية", TotalSteps = 5, CategoryOrder = 7,
                Steps = new() {
                    new PipelineStepDefinition { StepType = AiStepType.AdminComplaintClassification, DisplayName = "تصنيف الشكوى وتحديد الجهة" },
                    new PipelineStepDefinition { StepType = AiStepType.AdminComplaintFacts, DisplayName = "صياغة الوقائع" },
                    new PipelineStepDefinition { StepType = AiStepType.AdminComplaintViolation, DisplayName = "تحليل المخالفة" },
                    new PipelineStepDefinition { StepType = AiStepType.AdminComplaintRequests, DisplayName = "صياغة الطلبات" },
                    new PipelineStepDefinition { StepType = AiStepType.AdminComplaintAssembly, DisplayName = "تجميع الشكوى النهائية" }
                }
            },
            new PipelineDefinition { 
                Id = "ruling-analysis", Name = "تحليل الأحكام", TotalSteps = 4, CategoryOrder = 8,
                Steps = new() {
                    new PipelineStepDefinition { StepType = AiStepType.RulingAnalysisOperative, DisplayName = "تحليل المنطوق" },
                    new PipelineStepDefinition { StepType = AiStepType.RulingAnalysisReasoning, DisplayName = "تحليل الأسباب" },
                    new PipelineStepDefinition { StepType = AiStepType.RulingAnalysisDefectEvaluation, DisplayName = "تقييم العيوب" },
                    new PipelineStepDefinition { StepType = AiStepType.RulingAnalysisFeasibilityReport, DisplayName = "تقرير جدوى الطعن" }
                }
            },
            new PipelineDefinition { 
                Id = "legal-warning", Name = "الإنذار الرسمي", TotalSteps = 3, CategoryOrder = 9,
                Steps = new() {
                    new PipelineStepDefinition { StepType = AiStepType.LegalWarningClassification, DisplayName = "تصنيف الإنذار والتحليل القانوني" },
                    new PipelineStepDefinition { StepType = AiStepType.LegalWarningBodyDraft, DisplayName = "صياغة متن الإنذار" },
                    new PipelineStepDefinition { StepType = AiStepType.LegalWarningAssembly, DisplayName = "تجميع الإنذار النهائي" }
                }
            },
            new PipelineDefinition { 
                Id = "exec-request", Name = "الطلبات التنفيذية", TotalSteps = 3, CategoryOrder = 10,
                Steps = new() {
                    new PipelineStepDefinition { StepType = AiStepType.ExecRequestClassification, DisplayName = "تحليل وتصنيف طبيعة الطلب" },
                    new PipelineStepDefinition { StepType = AiStepType.ExecRequestDrafting, DisplayName = "صياغة الطلبات" },
                    new PipelineStepDefinition { StepType = AiStepType.ExecRequestAssembly, DisplayName = "تجميع العريضة النهائية" }
                }
            },
            new PipelineDefinition { 
                Id = "legal-contract-draft", Name = "إنشاء العقود القانونية", TotalSteps = 3, CategoryOrder = 11,
                Steps = new() {
                    new PipelineStepDefinition { StepType = AiStepType.LegalContractAnalysis, DisplayName = "تحليل المدخلات" },
                    new PipelineStepDefinition { StepType = AiStepType.LegalContractDraft, DisplayName = "صياغة مسودة العقد" },
                    new PipelineStepDefinition { StepType = AiStepType.LegalContractReview, DisplayName = "مراجعة وتدقيق العقد" }
                }
            }
        };

        public static PipelineDefinition? Get(string id)
        {
            return _pipelines.FirstOrDefault(p => p.Id == id);
        }

        public static IEnumerable<PipelineDefinition> GetAll()
        {
            return _pipelines;
        }

        public static IEnumerable<(AiStepType StepType, string DisplayName, string Category, int CategoryOrder)> GetAllIncludedStages()
        {
            return _pipelines.SelectMany(p => p.Steps.Select(s => (s.StepType, s.DisplayName, p.Name, p.CategoryOrder)));
        }

        public static int GetStepNumber(AiStepType stepType)
        {
            var pipeline = _pipelines.FirstOrDefault(p => p.Steps.Any(s => s.StepType == stepType));
            if (pipeline == null) throw new System.ArgumentOutOfRangeException(nameof(stepType), "Step type not found in any pipeline.");
            return pipeline.Steps.FindIndex(s => s.StepType == stepType) + 1;
        }
    }
}
