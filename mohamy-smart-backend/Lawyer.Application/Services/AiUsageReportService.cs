using Lawyer.Application.Dtos.AiUsageReport;
using Lawyer.Application.IServices;
using Lawyer.Core.Common;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lawyer.Application.Services
{
    public class AiUsageReportService : IAiUsageReportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AiUsageReportService> _logger;

        private static readonly string[] AllModelIdentifiers =
        [
            "gemini-3.1-pro-preview",
            "gemini-3-flash-preview",
            "gemini-3.1-flash-lite-preview"
        ];
        private const int TotalWorkflowCount = 8;

        public AiUsageReportService(IUnitOfWork unitOfWork, ILogger<AiUsageReportService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<AiUsageSummaryDto>> GetUsageSummaryAsync(DateTime? from, DateTime? to, CancellationToken ct)
        {
            try
            {
                var query = BuildQuery(from, to);

                var providerGroups = await query
                    .GroupBy(r => r.Provider)
                    .Select(g => new
                    {
                        Provider = g.Key,
                        Cost = g.Sum(r => r.EstimatedCostUsd),
                        Count = g.Count(),
                        Input = g.Sum(r => r.InputTokens),
                        Output = g.Sum(r => r.OutputTokens)
                    })
                    .ToListAsync(ct);

                var aiGroup = providerGroups.FirstOrDefault(g => g.Provider == "Gemini");
                var ocrGroup = providerGroups.FirstOrDefault(g => g.Provider == "GoogleVision");

                var modelGroups = await query
                    .Where(r => r.Provider == "Gemini")
                    .GroupBy(r => r.ModelIdentifier)
                    .Select(g => new
                    {
                        ModelIdentifier = g.Key,
                        Count = g.Count(),
                        Cost = g.Sum(r => r.EstimatedCostUsd),
                        Input = g.Sum(r => r.InputTokens),
                        Output = g.Sum(r => r.OutputTokens)
                    })
                    .ToListAsync(ct);

                var perModel = modelGroups
                    .Select(g => new ModelUsageDto
                    {
                        ModelIdentifier = g.ModelIdentifier,
                        DisplayName = AiCostCalculator.GetModelDisplayName(g.ModelIdentifier),
                        RequestCount = g.Count,
                        TotalCostUsd = g.Cost,
                        InputTokens = g.Input,
                        OutputTokens = g.Output
                    })
                    .OrderByDescending(m => m.TotalCostUsd)
                    .ToList();

                var dto = new AiUsageSummaryDto
                {
                    TotalCostUsd = providerGroups.Sum(g => g.Cost),
                    AiCostUsd = aiGroup?.Cost ?? 0,
                    OcrCostUsd = ocrGroup?.Cost ?? 0,
                    TotalRequests = providerGroups.Sum(g => g.Count),
                    AiRequests = aiGroup?.Count ?? 0,
                    OcrRequests = ocrGroup?.Count ?? 0,
                    TotalInputTokens = aiGroup?.Input ?? 0,
                    TotalOutputTokens = aiGroup?.Output ?? 0,
                    PerModel = perModel
                };

                return ApiExceptionResponse.Success(dto, "AI usage summary retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate AI usage summary");
                return ApiExceptionResponse.ServerError<AiUsageSummaryDto>("Failed to generate AI usage summary");
            }
        }

        public async Task<Result<PagedResponse<LawyerUsageDto>>> GetLawyerUsageAsync(int pageNumber, int pageSize, DateTime? from, DateTime? to, CancellationToken ct)
        {
            try
            {
                var query = BuildQuery(from, to);

                var lawyerStats = await query
                    .GroupBy(r => new { r.LawyerId, r.Provider })
                    .Select(g => new
                    {
                        LawyerId = g.Key.LawyerId,
                        Provider = g.Key.Provider,
                        Cost = g.Sum(r => r.EstimatedCostUsd),
                        Count = g.Count()
                    })
                    .ToListAsync(ct);

                var lawyerIds = lawyerStats.Select(s => s.LawyerId).Distinct().ToList();
                
                var lawyerLookup = await _unitOfWork.Repository<Core.Models.Lawyer>()
                    .AsQueryable()
                    .AsNoTracking()
                    .Where(l => lawyerIds.Contains(l.Id) || lawyerIds.Contains(l.ApplicationUserId))
                    .Include(l => l.ApplicationUser)
                    .ToListAsync(ct);

                var lawyerNamesByLawyerId = lawyerLookup
                    .GroupBy(l => l.Id)
                    .ToDictionary(g => g.Key, g => g.Select(l => l.ApplicationUser?.FullName).FirstOrDefault(name => !string.IsNullOrWhiteSpace(name)) ?? "Unknown");

                var lawyerNamesByUserId = lawyerLookup
                    .GroupBy(l => l.ApplicationUserId)
                    .ToDictionary(g => g.Key, g => g.Select(l => l.ApplicationUser?.FullName).FirstOrDefault(name => !string.IsNullOrWhiteSpace(name)) ?? "Unknown");

                var lawyerGroups = lawyerStats
                    .GroupBy(s => s.LawyerId)
                    .Select(g =>
                    {
                        var aiRecs = g.Where(s => s.Provider == "Gemini").ToList();
                        var ocrRecs = g.Where(s => s.Provider == "GoogleVision").ToList();
                        var lawyerName = lawyerNamesByLawyerId.GetValueOrDefault(g.Key)
                            ?? lawyerNamesByUserId.GetValueOrDefault(g.Key)
                            ?? "غير معروف";

                        return new LawyerUsageDto
                        {
                            LawyerId = g.Key,
                            LawyerName = lawyerName,
                            TotalCostUsd = g.Sum(s => s.Cost),
                            AiCostUsd = aiRecs.Sum(s => s.Cost),
                            OcrCostUsd = ocrRecs.Sum(s => s.Cost),
                            TotalRequests = g.Sum(s => s.Count),
                            AiRequests = aiRecs.Sum(s => s.Count),
                            OcrRequests = ocrRecs.Sum(s => s.Count)
                        };
                    })
                    .OrderByDescending(l => l.TotalCostUsd)
                    .ToList();

                var totalRecords = lawyerGroups.Count;
                var pagedData = lawyerGroups
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var pagedResponse = new PagedResponse<LawyerUsageDto>(pagedData, pageNumber, pageSize, totalRecords);

                return ApiExceptionResponse.Success(pagedResponse, "Lawyer usage retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate lawyer usage report");
                return ApiExceptionResponse.ServerError<PagedResponse<LawyerUsageDto>>("Failed to generate lawyer usage report");
            }
        }

        public async Task<Result<LawyerUsageDetailDto>> GetLawyerUsageDetailAsync(Guid lawyerId, DateTime? from, DateTime? to, CancellationToken ct)
        {
            try
            {
                var records = await BuildQuery(from, to)
                    .Where(r => r.LawyerId == lawyerId)
                    .ToListAsync(ct);

                if (records.Count == 0)
                    return ApiExceptionResponse.NotFound<LawyerUsageDetailDto>("Lawyer not found or no usage data available");

                var aiRecords = records.Where(r => r.Provider == "Gemini").ToList();
                var ocrRecords = records.Where(r => r.Provider == "GoogleVision").ToList();

                var lawyerEntity = await _unitOfWork.Repository<Core.Models.Lawyer>()
                    .AsQueryable()
                    .AsNoTracking()
                    .Where(l => l.Id == lawyerId || l.ApplicationUserId == lawyerId)
                    .Include(l => l.ApplicationUser)
                    .FirstOrDefaultAsync(ct);
                var lawyerName = !string.IsNullOrWhiteSpace(lawyerEntity?.ApplicationUser?.FullName)
                    ? lawyerEntity.ApplicationUser.FullName
                    : "غير معروف";

                var perStep = records
                    .GroupBy(r => r.AiStepType)
                    .Select(g => new StepUsageDto
                    {
                        StepType = (int)g.Key,
                        StepName = g.Key.ToString(),
                        RequestCount = g.Count(),
                        TotalCostUsd = g.Sum(r => r.EstimatedCostUsd)
                    })
                    .OrderByDescending(s => s.TotalCostUsd)
                    .ToList();

                var caseIds = records
                    .Where(r => r.CaseId.HasValue)
                    .Select(r => r.CaseId!.Value)
                    .Distinct()
                    .ToList();

                var caseLookup = await _unitOfWork.Repository<Case>()
                    .AsQueryable()
                    .AsNoTracking()
                    .Where(c => caseIds.Contains(c.Id))
                    .ToDictionaryAsync(c => c.Id, c => new { c.Title, c.Number }, ct);

                var perCaseWorkflows = records
                    .Where(r => r.CaseId.HasValue)
                    .GroupBy(r => r.CaseId!.Value)
                    .Select(caseGroup =>
                    {
                        caseLookup.TryGetValue(caseGroup.Key, out var caseInfo);

                        var workflows = caseGroup
                            .Select(r => new { Record = r, Workflow = MapWorkflow(r.AiStepType) })
                            .Where(x => x.Workflow is not null)
                            .GroupBy(x => x.Workflow!.Value.Key)
                            .Select(workflowGroup =>
                            {
                                var workflow = workflowGroup.First().Workflow!.Value;
                                return new WorkflowUsageDto
                                {
                                    WorkflowKey = workflow.Key,
                                    WorkflowName = workflow.Name,
                                    RequestCount = workflowGroup.Count(),
                                    TotalCostUsd = workflowGroup.Sum(x => x.Record.EstimatedCostUsd),
                                    Steps = workflowGroup
                                        .GroupBy(x => x.Record.AiStepType)
                                        .Select(stepGroup => new StepUsageDto
                                        {
                                            StepType = (int)stepGroup.Key,
                                            StepName = GetStepDisplayName(stepGroup.Key),
                                            ModelDisplayName = string.Join("، ",
                                                stepGroup
                                                    .Select(x => x.Record.Provider == "GoogleVision"
                                                        ? "Google Vision"
                                                        : AiCostCalculator.GetModelDisplayName(x.Record.ModelIdentifier))
                                                    .Where(name => !string.IsNullOrWhiteSpace(name))
                                                    .Distinct()),
                                            RequestCount = stepGroup.Count(),
                                            TotalCostUsd = stepGroup.Sum(x => x.Record.EstimatedCostUsd)
                                        })
                                        .OrderByDescending(s => s.TotalCostUsd)
                                        .ToList()
                                };
                            })
                            .OrderByDescending(w => w.TotalCostUsd)
                            .ToList();

                        return new CaseWorkflowUsageDto
                        {
                            CaseId = caseGroup.Key,
                            CaseTitle = string.IsNullOrWhiteSpace(caseInfo?.Title) ? "قضية بدون عنوان" : caseInfo.Title,
                            CaseNumber = caseInfo?.Number ?? "",
                            UsedWorkflowCount = workflows.Count,
                            TotalWorkflowCount = TotalWorkflowCount,
                            TotalCostUsd = caseGroup.Sum(r => r.EstimatedCostUsd),
                            Workflows = workflows
                        };
                    })
                    .OrderByDescending(c => c.TotalCostUsd)
                    .ToList();

                var perModel = aiRecords
                    .GroupBy(r => r.ModelIdentifier)
                    .Select(g => new ModelUsageDto
                    {
                        ModelIdentifier = g.Key,
                        DisplayName = AiCostCalculator.GetModelDisplayName(g.Key),
                        RequestCount = g.Count(),
                        TotalCostUsd = g.Sum(r => r.EstimatedCostUsd),
                        InputTokens = g.Sum(r => r.InputTokens),
                        OutputTokens = g.Sum(r => r.OutputTokens)
                    })
                    .OrderByDescending(m => m.TotalCostUsd)
                    .ToList();

                var dailyCosts = records
                    .GroupBy(r => r.CreatedAt.Date)
                    .Select(g => new DailyCostDto
                    {
                        Date = g.Key,
                        AiCost = g.Where(r => r.Provider == "Gemini").Sum(r => r.EstimatedCostUsd),
                        OcrCost = g.Where(r => r.Provider == "GoogleVision").Sum(r => r.EstimatedCostUsd),
                        Requests = g.Count()
                    })
                    .OrderBy(d => d.Date)
                    .ToList();

                // Non-case workflows (e.g., contract generation)
                var standaloneCosts = records
                    .Where(r => !r.CaseId.HasValue)
                    .Select(r => new { Record = r, Workflow = MapWorkflow(r.AiStepType) })
                    .Where(x => x.Workflow is not null)
                    .GroupBy(x => x.Workflow!.Value.Key)
                    .Select(workflowGroup =>
                    {
                        var workflow = workflowGroup.First().Workflow!.Value;
                        return new WorkflowUsageDto
                        {
                            WorkflowKey = workflow.Key,
                            WorkflowName = workflow.Name,
                            RequestCount = workflowGroup.Count(),
                            TotalCostUsd = workflowGroup.Sum(x => x.Record.EstimatedCostUsd),
                            Steps = workflowGroup
                                .GroupBy(x => x.Record.AiStepType)
                                .Select(stepGroup => new StepUsageDto
                                {
                                    StepType = (int)stepGroup.Key,
                                    StepName = GetStepDisplayName(stepGroup.Key),
                                    ModelDisplayName = string.Join("، ",
                                        stepGroup
                                            .Select(x => AiCostCalculator.GetModelDisplayName(x.Record.ModelIdentifier))
                                            .Where(name => !string.IsNullOrWhiteSpace(name))
                                            .Distinct()),
                                    RequestCount = stepGroup.Count(),
                                    TotalCostUsd = stepGroup.Sum(x => x.Record.EstimatedCostUsd)
                                })
                                .OrderByDescending(s => s.TotalCostUsd)
                                .ToList()
                        };
                    })
                    .OrderByDescending(w => w.TotalCostUsd)
                    .ToList();

                var dto = new LawyerUsageDetailDto
                {
                    LawyerId = lawyerId,
                    LawyerName = lawyerName,
                    TotalCostUsd = records.Sum(r => r.EstimatedCostUsd),
                    AiCostUsd = aiRecords.Sum(r => r.EstimatedCostUsd),
                    OcrCostUsd = ocrRecords.Sum(r => r.EstimatedCostUsd),
                    TotalRequests = records.Count,
                    AiRequests = aiRecords.Count,
                    OcrRequests = ocrRecords.Count,
                    PerStep = perStep,
                    PerModel = perModel,
                    DailyCosts = dailyCosts,
                    PerCaseWorkflows = perCaseWorkflows,
                    StandaloneCosts = standaloneCosts
                };

                return ApiExceptionResponse.Success(dto, "Lawyer usage detail retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate lawyer usage detail for {LawyerId}", lawyerId);
                return ApiExceptionResponse.ServerError<LawyerUsageDetailDto>("Failed to generate lawyer usage detail");
            }
        }

        public async Task<Result<List<ModelUsageDto>>> GetModelUsageAsync(DateTime? from, DateTime? to, CancellationToken ct)
        {
            try
            {
                var query = BuildQuery(from, to).Where(r => r.Provider == "Gemini");

                var stats = await query
                    .GroupBy(r => r.ModelIdentifier)
                    .Select(g => new
                    {
                        ModelIdentifier = g.Key,
                        Count = g.Count(),
                        Cost = g.Sum(r => r.EstimatedCostUsd),
                        Input = g.Sum(r => r.InputTokens),
                        Output = g.Sum(r => r.OutputTokens)
                    })
                    .ToDictionaryAsync(g => g.ModelIdentifier, ct);

                var result = AllModelIdentifiers
                    .Select(identifier =>
                    {
                        stats.TryGetValue(identifier, out var modelStats);

                        return new ModelUsageDto
                        {
                            ModelIdentifier = identifier,
                            DisplayName = AiCostCalculator.GetModelDisplayName(identifier),
                            RequestCount = modelStats?.Count ?? 0,
                            TotalCostUsd = modelStats?.Cost ?? 0,
                            InputTokens = modelStats?.Input ?? 0,
                            OutputTokens = modelStats?.Output ?? 0
                        };
                    })
                    .OrderByDescending(m => m.TotalCostUsd)
                    .ToList();

                return ApiExceptionResponse.Success(result, "Model usage retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate model usage report");
                return ApiExceptionResponse.ServerError<List<ModelUsageDto>>("Failed to generate model usage report");
            }
        }

        private IQueryable<AiUsageRecord> BuildQuery(DateTime? from, DateTime? to)
        {
            var query = _unitOfWork.Repository<AiUsageRecord>()
                .AsQueryable()
                .AsNoTracking();

            if (from.HasValue)
                query = query.Where(r => r.CreatedAt >= from.Value);

            if (to.HasValue)
                query = query.Where(r => r.CreatedAt <= to.Value);

            return query;
        }

        private static (string Key, string Name)? MapWorkflow(AiStepType stepType) => stepType switch
        {
            AiStepType.FactAnalysis
            or AiStepType.GenerateDefenses
            or AiStepType.AnalysisDefense
            or AiStepType.FinalRequirements
            or AiStepType.DefenseMemoDraft
                => ("defense-memo", "مذكرة الدفاع"),

            AiStepType.LawsuitCaseType
            or AiStepType.LawsuitParties
            or AiStepType.LawsuitSubjects
            or AiStepType.LawsuitFacts
            or AiStepType.LawsuitLegalBasis
            or AiStepType.LawsuitRequests
                => ("statement-of-claims", "صحيفة الدعوى"),

            AiStepType.AppealBriefJudgmentData
            or AiStepType.AppealBriefReasoningAnalysis
            or AiStepType.AppealBriefGrounds
            or AiStepType.AppealBriefRequests
            or AiStepType.AppealBriefLegalBasis
            or AiStepType.AppealBriefAssembly
                => ("appeal-brief", "صحيفة الاستئناف"),

            AiStepType.AdminComplaintClassification
            or AiStepType.AdminComplaintFacts
            or AiStepType.AdminComplaintViolation
            or AiStepType.AdminComplaintRequests
            or AiStepType.AdminComplaintAssembly
                => ("admin-complaint", "الشكوى الإدارية"),

            AiStepType.RulingAnalysisOperative
            or AiStepType.RulingAnalysisReasoning
            or AiStepType.RulingAnalysisDefectEvaluation
            or AiStepType.RulingAnalysisFeasibilityReport
                => ("ruling-analysis", "تحليل الحكم"),

            AiStepType.LegalWarningClassification
            or AiStepType.LegalWarningBodyDraft
            or AiStepType.LegalWarningAssembly
                => ("legal-warning", "الإنذار القانوني"),

            AiStepType.ExecRequestClassification
            or AiStepType.ExecRequestDrafting
            or AiStepType.ExecRequestAssembly
                => ("exec-request", "طلب التنفيذ"),

            AiStepType.LegalContractAnalysis
            or AiStepType.LegalContractDraft
            or AiStepType.LegalContractReview
                => ("legal-contract", "إنشاء العقود القانونية"),

            _ => null
        };

        private static string GetStepDisplayName(AiStepType stepType) => stepType switch
        {
            AiStepType.FactAnalysis => "تحليل الوقائع",
            AiStepType.GenerateDefenses => "توليد الدفوع",
            AiStepType.AnalysisDefense => "تحليل الدفاع",
            AiStepType.FinalRequirements => "الطلبات الختامية",
            AiStepType.DefenseMemoDraft => "المسودة النهائية لمذكرة الدفاع",

            AiStepType.LawsuitCaseType => "تحديد نوع الدعوى",
            AiStepType.LawsuitParties => "استخراج الأطراف",
            AiStepType.LawsuitSubjects => "تحديد الموضوع",
            AiStepType.LawsuitFacts => "صياغة الوقائع",
            AiStepType.LawsuitLegalBasis => "التأسيس القانوني",
            AiStepType.LawsuitRequests => "صياغة الطلبات",

            AiStepType.Ocr => "التعرف البصري OCR",
            AiStepType.ClarifyFacts => "استيضاح الوقائع",
            AiStepType.Chat => "المحادثة",

            AiStepType.AppealBriefJudgmentData => "استخراج بيانات الحكم",
            AiStepType.AppealBriefReasoningAnalysis => "تحليل أسباب الحكم",
            AiStepType.AppealBriefGrounds => "تحديد أوجه الطعن",
            AiStepType.AppealBriefRequests => "صياغة الطلبات",
            AiStepType.AppealBriefLegalBasis => "السند القانوني",
            AiStepType.AppealBriefAssembly => "تجميع الصحيفة النهائية",

            AiStepType.AdminComplaintClassification => "تصنيف الشكوى",
            AiStepType.AdminComplaintFacts => "صياغة الوقائع",
            AiStepType.AdminComplaintViolation => "تحليل المخالفة",
            AiStepType.AdminComplaintRequests => "صياغة الطلبات",
            AiStepType.AdminComplaintAssembly => "تجميع الشكوى النهائية",

            AiStepType.RulingAnalysisOperative => "تحليل المنطوق",
            AiStepType.RulingAnalysisReasoning => "تحليل الأسباب",
            AiStepType.RulingAnalysisDefectEvaluation => "تقييم العيوب",
            AiStepType.RulingAnalysisFeasibilityReport => "تقرير جدوى الطعن",

            AiStepType.LegalWarningClassification => "تصنيف الإنذار",
            AiStepType.LegalWarningBodyDraft => "صياغة متن الإنذار",
            AiStepType.LegalWarningAssembly => "تجميع الإنذار النهائي",

            AiStepType.ExecRequestClassification => "تصنيف طلب التنفيذ",
            AiStepType.ExecRequestDrafting => "صياغة الطلب",
            AiStepType.ExecRequestAssembly => "تجميع عريضة التنفيذ",

            AiStepType.LegalContractAnalysis => "تحليل مدخلات العقد",
            AiStepType.LegalContractDraft => "صياغة مسودة العقد",
            AiStepType.LegalContractReview => "مراجعة وتدقيق العقد",

            _ => stepType.ToString()
        };
    }
}
