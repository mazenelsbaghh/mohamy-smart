using Lawyer.Application.Common;
using Lawyer.Application.Dtos.Contracts;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Core.Common;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class LegalContractService : ILegalContractService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAIProviderFactory _aiProviderFactory;
        private readonly IAiUsageTrackingService _trackingService;
        private readonly string _contentRootPath;
        private readonly ILogger<LegalContractService> _logger;

        // Required sections in AI output — used for validation
        private static readonly string[] RequiredSections = new[]
        {
            "عنوان_العقد", "أطراف_العقد", "موضوع_العقد",
            "البنود_الأساسية", "أحكام_عامة", "التوقيعات"
        };

        private const int MaxRetryAttempts = 1;

        // Fixed contract type catalog — no DB table needed per spec
        private static readonly IReadOnlyList<ContractTypeOptionDto> ContractTypes = new List<ContractTypeOptionDto>
        {
            new ContractTypeOptionDto { Code = "lease",          DisplayNameAr = "عقد إيجار",           Description = "عقد إيجار عقار أو منقول", DisplayOrder = 1 },
            new ContractTypeOptionDto { Code = "sale",           DisplayNameAr = "عقد بيع",              Description = "عقد بيع منقول أو عقار",   DisplayOrder = 2 },
            new ContractTypeOptionDto { Code = "employment",     DisplayNameAr = "عقد عمل",              Description = "عقد توظيف وعمل",           DisplayOrder = 3 },
            new ContractTypeOptionDto { Code = "partnership",    DisplayNameAr = "عقد شراكة",            Description = "عقد شراكة تجارية",         DisplayOrder = 4 },
            new ContractTypeOptionDto { Code = "services",       DisplayNameAr = "عقد خدمات",            Description = "عقد تقديم خدمات مهنية",    DisplayOrder = 5 },
            new ContractTypeOptionDto { Code = "loan",           DisplayNameAr = "عقد قرض",              Description = "عقد إقراض مالي",            DisplayOrder = 6 },
            new ContractTypeOptionDto { Code = "power_attorney", DisplayNameAr = "توكيل رسمي",           Description = "توكيل رسمي عام أو خاص",    DisplayOrder = 7 },
            new ContractTypeOptionDto { Code = "contractor",     DisplayNameAr = "عقد مقاولة",           Description = "عقد أعمال مقاولات",        DisplayOrder = 8 },
            new ContractTypeOptionDto { Code = "agency",         DisplayNameAr = "عقد وكالة",            Description = "عقد وكالة تجارية",          DisplayOrder = 9 },
            new ContractTypeOptionDto { Code = "other",          DisplayNameAr = "عقد آخر",              Description = "أنواع عقود أخرى",           DisplayOrder = 10 },
        };

        private readonly PromptTemplateCache _promptCache;

        public LegalContractService(
            IUnitOfWork unitOfWork,
            IAIProviderFactory aiProviderFactory,
            IAiUsageTrackingService trackingService,
            IConfiguration config,
            ILogger<LegalContractService> logger,
            PromptTemplateCache promptCache)
        {
            _unitOfWork = unitOfWork;
            _aiProviderFactory = aiProviderFactory;
            _trackingService = trackingService;
            _contentRootPath = config.GetValue<string>("contentRoot") ?? Directory.GetCurrentDirectory();
            _logger = logger;
            _promptCache = promptCache;
        }

        // ─── US1: Contract type catalog ──────────────────────────────────────────

        public Task<Result<IReadOnlyList<ContractTypeOptionDto>>> GetAvailableContractTypesAsync(
            CancellationToken cancellationToken)
        {
            return Task.FromResult(Result<IReadOnlyList<ContractTypeOptionDto>>.Success(ContractTypes));
        }

        // ─── US1 + US2: Create and generate a new legal contract ─────────────────

        public async Task<Result<LegalContractDetailsDto>> CreateLegalContractAsync(
            Guid lawyerId,
            Guid createdByUserId,
            CreateLegalContractRequestDto request,
            CancellationToken cancellationToken)
        {
            // 1. Validate contract type
            var contractType = ContractTypes.FirstOrDefault(t => t.Code == request.ContractTypeCode);
            if (contractType == null)
                return Result<LegalContractDetailsDto>.Error(HttpStatusCode.BadRequest,
                    "نوع العقد المحدد غير مدعوم. الرجاء اختيار نوع عقد صالح.");

            // 2. Validate client ownership
            var client = await _unitOfWork.Repository<Client>()
                .FirstOrDefaultAsync(c => c.Id == request.ClientId && c.LawyerId == lawyerId, cancellationToken);

            if (client == null)
                return Result<LegalContractDetailsDto>.Error(HttpStatusCode.NotFound,
                    "الموكل غير موجود أو لا ينتمي إلى محامي هذا الحساب.");

            // 3. Load the lawyer info for the prompt
            var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
                .FirstOrDefaultAsync(l => l.Id == lawyerId, cancellationToken,
                    l => l.ApplicationUser);

            if (lawyer == null)
                return Result<LegalContractDetailsDto>.Error(HttpStatusCode.NotFound, "ملف المحامي غير موجود.");

            // 4. Get configured AI models for each pipeline step (admin-configurable)
            var step1Model = await _aiProviderFactory.GetModelForStepAsync(AiStepType.LegalContractAnalysis);
            var step2Model = await _aiProviderFactory.GetModelForStepAsync(AiStepType.LegalContractDraft);
            var step3Model = await _aiProviderFactory.GetModelForStepAsync(AiStepType.LegalContractReview);

            // 5. Load and fill prompt template
            string promptTemplate;
            try
            {
                promptTemplate = await _promptCache.GetAsync(Path.Combine("legal-contracts", "legal-contract-draft.txt"), cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load legal contract prompt template");
                return Result<LegalContractDetailsDto>.Error(HttpStatusCode.InternalServerError,
                    "حدث خطأ داخلي عند تحميل قالب العقد.");
            }

            var lawyerInfo = $"المحامي: {lawyer.ApplicationUser?.FullName ?? "المحامي"}" +
                             (string.IsNullOrWhiteSpace(lawyer.LawFirmName) ? "" : $"\nمكتب المحاماة: {lawyer.LawFirmName}") +
                             (string.IsNullOrWhiteSpace(lawyer.BarNumber) ? "" : $"\nرقم القيد: {lawyer.BarNumber}");

            var systemPrompt = promptTemplate
                .Replace("{LAWYER_INFO}", lawyerInfo)
                .Replace("{CLIENT_NAME}", client.ClientName)
                .Replace("{CLIENT_NATIONAL_ID}", string.IsNullOrWhiteSpace(client.NationalId) ? "غير محدد" : client.NationalId)
                .Replace("{CLIENT_ADDRESS}", string.IsNullOrWhiteSpace(client.Address) ? "غير محدد" : client.Address)
                .Replace("{CLIENT_PHONE}", string.IsNullOrWhiteSpace(client.PhoneNumber) ? "غير محدد" : client.PhoneNumber)
                .Replace("{CLIENT_EMAIL}", string.IsNullOrWhiteSpace(client.Email) ? "غير محدد" : client.Email)
                .Replace("{CONTRACT_TYPE_NAME}", contractType.DisplayNameAr)
                .Replace("{INPUT_DETAILS}", request.Details)
                .Replace("{CUSTOM_CLAUSES}", string.IsNullOrWhiteSpace(request.CustomClauses) ? "لا توجد بنود خاصة إضافية." : request.CustomClauses);

            // 6. Persist a placeholder contract record
            var contract = new LegalContract
            {
                Id = Guid.NewGuid(),
                LawyerId = lawyerId,
                ClientId = request.ClientId,
                ContractTypeCode = request.ContractTypeCode,
                ContractTypeName = contractType.DisplayNameAr,
                InputDetails = request.Details,
                CustomClauses = request.CustomClauses,
                Status = LegalContractStatus.DraftingRequested,
                AiStepType = AiStepType.LegalContractDraft,
                ModelIdentifier = step2Model,
                CreatedAtUtc = DateTime.UtcNow,
                CreatedByUserId = createdByUserId,
            };

            await _unitOfWork.Repository<LegalContract>().AddAsync(contract);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // ═══════════════════════════════════════════════════════════════
            // 3-STEP CONTRACT PIPELINE
            // Step 1: Analyze inputs → Step 2: Draft contract → Step 3: Review & polish
            // ═══════════════════════════════════════════════════════════════

            var provider = _aiProviderFactory.GetProvider();

            // ─── STEP 1: Input Analysis ───────────────────────────────────
            _logger.LogInformation("Contract pipeline Step 1/3: Analyzing inputs for contract {ContractId}", contract.Id);

            string step1Analysis;
            try
            {
                var step1Template = await _promptCache.GetAsync(Path.Combine("legal-contracts", "contract-step1-analysis.txt"), cancellationToken);

                var step1Prompt = step1Template
                    .Replace("{CONTRACT_TYPE_NAME}", contractType.DisplayNameAr)
                    .Replace("{INPUT_DETAILS}", request.Details)
                    .Replace("{CUSTOM_CLAUSES}", string.IsNullOrWhiteSpace(request.CustomClauses)
                        ? "لا توجد بنود خاصة إضافية." : request.CustomClauses);

                var step1Options = AIRequestOptions.ForContractDraft with { Model = step1Model, MaxTokens = 4000 }; // Analysis needs fewer tokens
                var step1Result = await provider.SendChatCompletionAsync(
                    step1Prompt, "حلل المدخلات الآن واستخرج العناصر الأساسية.", step1Options, cancellationToken);

                if (!step1Result.Succeeded || string.IsNullOrWhiteSpace(step1Result.Data?.Content))
                {
                    _logger.LogWarning("Contract Step 1 failed, falling back to direct drafting");
                    // Fallback: proceed with raw input if analysis fails
                    step1Analysis = $"=== موضوع_العقد ===\n{contractType.DisplayNameAr}\n\n" +
                                    $"=== الالتزامات_الرئيسية ===\n{request.Details}\n\n" +
                                    $"=== البنود_الخاصة_المؤكدة ===\n{request.CustomClauses ?? "لا توجد"}";
                }
                else
                {
                    step1Analysis = step1Result.Data.Content;
                    // Track Step 1 usage
                    await _trackingService.RecordGeminiUsageAsync(
                        lawyerId, null, AiStepType.LegalContractAnalysis,
                        step1Model, step1Result.Data.Usage, cancellationToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load Step 1 prompt, using raw input as fallback");
                step1Analysis = $"=== موضوع_العقد ===\n{contractType.DisplayNameAr}\n\n" +
                                $"=== الالتزامات_الرئيسية ===\n{request.Details}\n\n" +
                                $"=== البنود_الخاصة_المؤكدة ===\n{request.CustomClauses ?? "لا توجد"}";
            }

            // ─── STEP 2: Contract Drafting ─────────────────────────────────
            _logger.LogInformation("Contract pipeline Step 2/3: Drafting contract {ContractId}", contract.Id);

            // Enhance the system prompt with the structured analysis
            var enrichedSystemPrompt = systemPrompt +
                "\n\n--- التحليل المنظم للمدخلات (تم استخراجه آليًا — استخدمه كمرجع إضافي) ---\n" +
                step1Analysis;

            Result<AIResponse>? step2Result = null;
            string? draftContent = null;
            int attempt = 0;
            var step2Options = AIRequestOptions.ForContractDraft with { Model = step2Model };

            while (attempt <= MaxRetryAttempts)
            {
                attempt++;
                var userPrompt = attempt == 1
                    ? "أنشئ العقد الآن وفق التعليمات والتنسيق المطلوب، مع مراعاة التحليل المنظم."
                    : "العقد السابق كان ناقصًا. أعد صياغته كاملًا بجميع الأقسام المطلوبة.";

                step2Result = await provider.SendChatCompletionAsync(
                    enrichedSystemPrompt, userPrompt, step2Options, cancellationToken);

                if (!step2Result.Succeeded || string.IsNullOrWhiteSpace(step2Result.Data?.Content))
                {
                    var errorMsg = CategorizeAiError(step2Result);
                    _logger.LogWarning("Contract Step 2 failed (attempt {Attempt}): {Error}", attempt, errorMsg);

                    if (attempt > MaxRetryAttempts)
                    {
                        contract.Status = LegalContractStatus.Failed;
                        contract.LastErrorMessage = errorMsg;
                        await _unitOfWork.Repository<LegalContract>().Update(contract);
                        await _unitOfWork.SaveChangesAsync(cancellationToken);
                        return Result<LegalContractDetailsDto>.Error(HttpStatusCode.ServiceUnavailable, errorMsg);
                    }
                    continue;
                }

                // Track Step 2 usage
                await _trackingService.RecordGeminiUsageAsync(
                    lawyerId, null, AiStepType.LegalContractDraft,
                    step2Model, step2Result.Data.Usage, cancellationToken);

                // Validate output sections
                var (isValid, missingSections) = ValidateContractOutput(step2Result.Data.Content);
                if (isValid)
                {
                    draftContent = step2Result.Data.Content;
                    break;
                }

                _logger.LogWarning("Contract Step 2 output missing sections (attempt {Attempt}): {Missing}",
                    attempt, string.Join(", ", missingSections));
            }

            // Accept whatever we have if validation never passed
            if (string.IsNullOrWhiteSpace(draftContent))
                draftContent = step2Result?.Data?.Content;

            if (string.IsNullOrWhiteSpace(draftContent))
            {
                contract.Status = LegalContractStatus.Failed;
                contract.LastErrorMessage = "فشل صياغة مسودة العقد بعد محاولات متعددة.";
                await _unitOfWork.Repository<LegalContract>().Update(contract);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return Result<LegalContractDetailsDto>.Error(HttpStatusCode.ServiceUnavailable,
                    "فشل توليد مسودة العقد. الرجاء المحاولة مرة أخرى.");
            }

            // ─── STEP 3: Quality Review ───────────────────────────────────
            _logger.LogInformation("Contract pipeline Step 3/3: Reviewing contract {ContractId}", contract.Id);

            string finalContent = draftContent; // Default: use draft if review fails
            try
            {
                var step3Template = await _promptCache.GetAsync(Path.Combine("legal-contracts", "contract-step3-review.txt"), cancellationToken);

                var step3Prompt = step3Template
                    .Replace("{STEP1_ANALYSIS}", step1Analysis)
                    .Replace("{STEP2_DRAFT}", draftContent);

                var step3Options = AIRequestOptions.ForContractDraft with { Model = step3Model };
                var step3Result = await provider.SendChatCompletionAsync(
                    step3Prompt, "راجع العقد الآن وأخرج النسخة النهائية المحسنة.", step3Options, cancellationToken);

                if (step3Result.Succeeded && !string.IsNullOrWhiteSpace(step3Result.Data?.Content))
                {
                    // Track Step 3 usage
                    await _trackingService.RecordGeminiUsageAsync(
                        lawyerId, null, AiStepType.LegalContractReview,
                        step3Model, step3Result.Data.Usage, cancellationToken);

                    // Only use reviewed version if it's at least as complete as the draft
                    var (reviewValid, _) = ValidateContractOutput(step3Result.Data.Content);
                    if (reviewValid)
                    {
                        finalContent = step3Result.Data.Content;
                        _logger.LogInformation("Contract Step 3 review applied successfully for {ContractId}", contract.Id);
                    }
                    else
                    {
                        _logger.LogWarning("Contract Step 3 review output was incomplete, keeping Step 2 draft for {ContractId}", contract.Id);
                    }
                }
                else
                {
                    _logger.LogWarning("Contract Step 3 review failed, keeping Step 2 draft for {ContractId}", contract.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to run Step 3 review, keeping Step 2 draft for {ContractId}", contract.Id);
            }

            // ─── Persist final content ────────────────────────────────────
            contract.GeneratedContent = finalContent;
            contract.Status = LegalContractStatus.Generated;
            await _unitOfWork.Repository<LegalContract>().Update(contract);
            await _unitOfWork.SaveChangesAsync(cancellationToken);


            return Result<LegalContractDetailsDto>.Created(MapToDetailsDto(contract, client.ClientName));
        }

        // ─── US3: List contracts ──────────────────────────────────────────────────

        public async Task<Result<PagedResponse<LegalContractDto>>> GetLegalContractsAsync(
            Guid lawyerId,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken)
        {
            var query = _unitOfWork.Repository<LegalContract>()
                .AsQueryable()
                .Where(c => c.LawyerId == lawyerId)
                .OrderByDescending(c => c.CreatedAtUtc);

            var totalCount = query.Count();

            var contracts = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Join(_unitOfWork.Repository<Client>().AsQueryable(),
                    c => c.ClientId,
                    cl => cl.Id,
                    (c, cl) => new LegalContractDto
                    {
                        ContractId = c.Id,
                        ContractType = c.ContractTypeName,
                        ClientName = cl.ClientName,
                        Status = c.Status.ToString(),
                        CreatedAt = c.CreatedAtUtc,
                        LastUpdatedAt = null,
                        DetailAvailable = c.Status == LegalContractStatus.Generated,
                    })
                .ToList();

            var paged = new PagedResponse<LegalContractDto>(contracts, pageNumber, pageSize, totalCount);
            return Result<PagedResponse<LegalContractDto>>.Success(paged);
        }

        // ─── US3: Get single contract ─────────────────────────────────────────────

        public async Task<Result<LegalContractDetailsDto>> GetLegalContractDetailsAsync(
            Guid lawyerId,
            Guid contractId,
            CancellationToken cancellationToken)
        {
            var contract = await _unitOfWork.Repository<LegalContract>()
                .FirstOrDefaultAsync(c => c.Id == contractId, cancellationToken);

            if (contract == null)
                return Result<LegalContractDetailsDto>.Error(HttpStatusCode.NotFound, "العقد غير موجود.");

            if (contract.LawyerId != lawyerId)
                return Result<LegalContractDetailsDto>.Error(HttpStatusCode.Forbidden,
                    "لا يحق لك الوصول إلى هذا العقد.");

            var client = await _unitOfWork.Repository<Client>()
                .FirstOrDefaultAsync(c => c.Id == contract.ClientId, cancellationToken);

            return Result<LegalContractDetailsDto>.Success(
                MapToDetailsDto(contract, client?.ClientName ?? "غير محدد"));
        }

        // ─── Helpers ─────────────────────────────────────────────────────────────

        /// <summary>
        /// Validates that the AI-generated contract output contains all required sections.
        /// Uses the === section_name === markers defined in the prompt template.
        /// </summary>
        private static (bool IsValid, List<string> MissingSections) ValidateContractOutput(string content)
        {
            var missing = new List<string>();
            foreach (var section in RequiredSections)
            {
                if (!content.Contains($"=== {section} ===", StringComparison.OrdinalIgnoreCase))
                    missing.Add(section);
            }
            return (missing.Count == 0, missing);
        }

        /// <summary>
        /// Categorizes AI errors into user-friendly Arabic messages.
        /// Follows Agent Tool Builder pattern: errors that help recovery.
        /// </summary>
        private static string CategorizeAiError(Result<AIResponse>? result)
        {
            if (result == null)
                return "حدث خطأ غير متوقع أثناء الاتصال بالذكاء الاصطناعي.";

            var msg = result.Message?.ToLowerInvariant() ?? "";

            if (msg.Contains("timeout") || msg.Contains("timed out") || msg.Contains("deadline"))
                return "استغرق توليد العقد وقتًا أطول من المتوقع. حاول مرة أخرى أو اختصر التفاصيل.";

            if (msg.Contains("rate limit") || msg.Contains("429") || msg.Contains("quota"))
                return "تم تجاوز حد الاستخدام المسموح حاليًا. انتظر دقيقة ثم حاول مرة أخرى.";

            if (msg.Contains("token") || msg.Contains("length") || msg.Contains("too long"))
                return "التفاصيل المدخلة طويلة جدًا. حاول اختصار التفاصيل أو البنود.";

            if (msg.Contains("content filter") || msg.Contains("safety") || msg.Contains("blocked"))
                return "المحتوى المدخل يحتوي على عناصر لا يمكن معالجتها. راجع التفاصيل والبنود.";

            if (msg.Contains("model") && (msg.Contains("not found") || msg.Contains("unavailable") || msg.Contains("deprecated")))
                return "الموديل المحدد في الإعدادات غير متاح حاليًا. تواصل مع المسؤول لتحديث إعدادات الموديل.";

            if (msg.Contains("unauthorized") || msg.Contains("401") || msg.Contains("api key"))
                return "خطأ في مفتاح الذكاء الاصطناعي. تواصل مع المسؤول لمراجعة الإعدادات.";

            return "فشل توليد مسودة العقد. الرجاء المحاولة مرة أخرى أو التواصل مع الدعم.";
        }

        private static LegalContractDetailsDto MapToDetailsDto(LegalContract contract, string clientName)
        {
            return new LegalContractDetailsDto
            {
                ContractId = contract.Id,
                ContractTypeCode = contract.ContractTypeCode,
                ContractTypeName = contract.ContractTypeName,
                ClientId = contract.ClientId,
                ClientName = clientName,
                InputDetails = contract.InputDetails,
                CustomClauses = contract.CustomClauses,
                GeneratedContent = contract.GeneratedContent ?? string.Empty,
                Status = contract.Status,
                AiStepType = contract.AiStepType,
                ModelIdentifier = contract.ModelIdentifier,
                CreatedAtUtc = contract.CreatedAtUtc,
            };
        }
    }
}
