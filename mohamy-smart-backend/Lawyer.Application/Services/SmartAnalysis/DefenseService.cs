using Hangfire;
using Lawyer.Application.Common;
using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Lawyer.Application.Services.SmartAnalysis
{
    public class DefenseService : IDefenseService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<DefenseService> _logger;
        private readonly IAIProviderFactory _aiProviderFactory;
        private readonly ICaseAccessValidator _caseAccessValidator;
        private readonly IAiUsageTrackingService _trackingService;
        private readonly IPromptService _promptService;
        private readonly IBackgroundJobClient? _backgroundJobs;

        private static readonly JsonSerializerOptions CamelCaseOptions = Common.JsonOptions.Serialize;
        private static readonly JsonSerializerOptions DeserializeOptions = Common.JsonOptions.Deserialize;

        public DefenseService(
            IUnitOfWork unitOfWork,
            ILogger<DefenseService> logger,
            IAIProviderFactory aiProviderFactory,
            ICaseAccessValidator caseAccessValidator,
            IAiUsageTrackingService trackingService,
            IPromptService promptService,
            IBackgroundJobClient? backgroundJobs = null)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _aiProviderFactory = aiProviderFactory;
            _caseAccessValidator = caseAccessValidator;
            _trackingService = trackingService;
            _promptService = promptService;
            _backgroundJobs = backgroundJobs;
        }

        private async Task TrackUsageAsync(Guid lawyerId, Guid? caseId, AiStepType step, string model, AIUsageMetadata? usage)
        {
            if (_backgroundJobs != null)
            {
                _backgroundJobs.Enqueue<IAiUsageTrackingService>(s =>
                    s.RecordGeminiUsageAsync(lawyerId, caseId, step, model, usage, CancellationToken.None));
            }
            else
            {
                await _trackingService.RecordGeminiUsageAsync(lawyerId, caseId, step, model, usage, CancellationToken.None);
            }
        }

        private async Task<string> ResolveCaseTypeNameAsync(int caseTypeId, CancellationToken cancellationToken)
        {
            var caseType = await _unitOfWork.Repository<Core.Models.CaseType>()
                .FirstOrDefaultAsync(x => x.Id == caseTypeId, cancellationToken);
            return caseType?.Title ?? string.Empty;
        }

        private async Task<(Core.Models.Case? Case, Core.Models.FactAnalysis? FactAnalysis, IEnumerable<Core.Models.Defense> Defenses)>
            GetCaseWithAnalysisDataAsync(Guid caseId, CancellationToken cancellationToken)
        {
            var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                .FirstOrDefaultAsync(x => x.Id == caseId, cancellationToken, x => x.CaseType);
            var factAnalysis = await _unitOfWork.Repository<Core.Models.FactAnalysis>()
                .FirstOrDefaultAsync(x => x.CaseId == caseId, cancellationToken);
            var defenses = await _unitOfWork.Repository<Core.Models.Defense>()
                .WhereAsync(x => x.CaseId == caseId, cancellationToken);

            return (caseEntity, factAnalysis, defenses);
        }

        private static DefenseDetailDto MapToDefenseDetailDto(Core.Models.Defense defense)
        {
            return new DefenseDetailDto
            {
                Id = defense.Id,
                DefenseTitle = defense.DefenseTitle,
                BasisFromCase = defense.BasisFromCase,
                Scope = defense.Scope,
                Strength = defense.Strength.ToString()
            };
        }

        private static Core.Enum.DefenseStrength ParseStrength(string strength)
        {
            return strength?.ToLower() switch
            {
                "strong" => Core.Enum.DefenseStrength.Strong,
                "medium" => Core.Enum.DefenseStrength.Medium,
                "weak" => Core.Enum.DefenseStrength.Weak,
                _ => Core.Enum.DefenseStrength.Medium
            };
        }

        private static Core.Enum.RequestLevel ParseRequestLevel(string level)
        {
            return level switch
            {
                "أصلي" => Core.Enum.RequestLevel.Primary,
                "احتياطي" => Core.Enum.RequestLevel.Subsidiary,
                "احتياطي كلي" => Core.Enum.RequestLevel.TotalSubsidiary,
                _ => Core.Enum.RequestLevel.Primary
            };
        }

        private static FinalPrayerItemDto MapToFinalPrayerDto(Core.Models.FinalPrayer prayer)
        {
            return new FinalPrayerItemDto
            {
                Id = prayer.Id,
                RequestLevel = prayer.Level switch
                {
                    Core.Enum.RequestLevel.Primary => "أصلي",
                    Core.Enum.RequestLevel.Subsidiary => "احتياطي",
                    Core.Enum.RequestLevel.TotalSubsidiary => "احتياطي كلي",
                    _ => "أصلي"
                },
                RequestText = prayer.RequestText
            };
        }

        public async Task<Result<CaseDefensesResultDto>> GenerateCaseDefensesAsync(
    CaseDefensesRequestDto request,
    string userId,
    CancellationToken cancellationToken)
{
    try
    {
        if (request.CaseId == Guid.Empty)
            return Result<CaseDefensesResultDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

        if (string.IsNullOrWhiteSpace(request.CaseFacts))
            return Result<CaseDefensesResultDto>.Error(System.Net.HttpStatusCode.BadRequest, "وقائع القضية مطلوبة");

        if (request.LegalAnalysis == null)
            return Result<CaseDefensesResultDto>.Error(System.Net.HttpStatusCode.BadRequest, "التحليل القانوني مطلوب");

        var caseEntity = await _unitOfWork
            .Repository<Core.Models.Case>()
            .FirstOrDefaultAsync(x => x.Id == request.CaseId, cancellationToken, x => x.CaseType);

        if (caseEntity == null)
            return Result<CaseDefensesResultDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

        var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
        if (!accessResult.Succeeded)
            return Result<CaseDefensesResultDto>.Error(accessResult.StatusCode, accessResult.Message);

        var finalPrompt = await BuildDefensesPromptAsync(caseEntity, request, cancellationToken);
        if (finalPrompt == null)
            return Result<CaseDefensesResultDto>.Error(HttpStatusCode.InternalServerError, "Defenses prompt file not found");

        _logger.LogInformation("Generating defenses for Case ID: {CaseId}", request.CaseId);

        var aiProvider = _aiProviderFactory.GetProvider();
        var defensesModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.GenerateDefenses);
        var systemPromptContent = await _promptService.GetPromptIfExistsAsync(Path.Combine("المرحلة الأولى إعداد مذكرة الدفاع", "defense-step2-generate-defenses.txt"), cancellationToken);

        if (systemPromptContent == null)
            return Result<CaseDefensesResultDto>.Error(HttpStatusCode.InternalServerError, "Defenses system prompt file not found");

        var aiResult = await aiProvider.SendChatCompletionAsync(
            systemPromptContent,
            finalPrompt,
            AIRequestOptions.ForDefenses with { Model = defensesModel },
            cancellationToken);

        if (!aiResult.Succeeded || string.IsNullOrWhiteSpace(aiResult.Data?.Content))
            return Result<CaseDefensesResultDto>.Error(HttpStatusCode.InternalServerError, "فشل في توليد الدفوع");

        var rawDefensesText = aiResult.Data.Content;
        var lawyerIdStr = userId;
        var lawyerId = !string.IsNullOrEmpty(lawyerIdStr) ? Guid.Parse(lawyerIdStr) : caseEntity.LawyerId;
        await TrackUsageAsync(lawyerId, request.CaseId, AiStepType.GenerateDefenses, defensesModel, aiResult.Data.Usage);

        var parsedDefenses = ParseDefensesJson(rawDefensesText);
        if (parsedDefenses == null)
            return Result<CaseDefensesResultDto>.Error(HttpStatusCode.InternalServerError, "فشل في تحليل الدفوع");

        await using var tx = await _unitOfWork.BeginTransactionAsync();

        var existingDefenses = await _unitOfWork.Repository<Core.Models.Defense>()
            .WhereAsync(x => x.CaseId == request.CaseId, cancellationToken);

        foreach (var existing in existingDefenses)
            _unitOfWork.Repository<Core.Models.Defense>().Delete(existing);

        var defensesToSave = (parsedDefenses.DefensesFormal ?? new List<DefenseDetailDto>())
            .Select(d => CreateDefenseEntity(request.CaseId, Core.Enum.DefenseType.Formal, d))
            .Concat((parsedDefenses.DefensesSubstantive ?? new List<DefenseDetailDto>())
                .Select(d => CreateDefenseEntity(request.CaseId, Core.Enum.DefenseType.Substantive, d)))
            .Concat((parsedDefenses.DefensesEvidentiary ?? new List<DefenseDetailDto>())
                .Select(d => CreateDefenseEntity(request.CaseId, Core.Enum.DefenseType.Evidentiary, d)))
            .ToList();

        foreach (var d in defensesToSave)
            await _unitOfWork.Repository<Core.Models.Defense>().AddAsync(d);
        await _unitOfWork.SaveChangesAsync(CancellationToken.None);
        await tx.CommitAsync(CancellationToken.None);

        _logger.LogInformation("Saved {Count} defenses for Case ID: {CaseId}", defensesToSave.Count, request.CaseId);

        var result = new CaseDefensesResultDto
        {
            DefensesFormal = defensesToSave
                .Where(d => d.Type == Core.Enum.DefenseType.Formal)
                .Select(MapToDefenseDetailDto)
                .ToList(),
            DefensesSubstantive = defensesToSave
                .Where(d => d.Type == Core.Enum.DefenseType.Substantive)
                .Select(MapToDefenseDetailDto)
                .ToList(),
            DefensesEvidentiary = defensesToSave
                .Where(d => d.Type == Core.Enum.DefenseType.Evidentiary)
                .Select(MapToDefenseDetailDto)
                .ToList()
        };

        return Result<CaseDefensesResultDto>.Success(result, "تم توليد الدفوع القانونية بنجاح");
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error generating defenses for Case {CaseId}", request.CaseId);
        return Result<CaseDefensesResultDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء توليد الدفوع");
    }
}

        public async Task<Result<CaseDefensesResultDto>> GetDefensesByCaseIdAsync(Guid caseId, string userId, CancellationToken cancellationToken)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<CaseDefensesResultDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == caseId, cancellationToken);

                if (caseEntity == null)
                    return Result<CaseDefensesResultDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<CaseDefensesResultDto>.Error(accessResult.StatusCode, accessResult.Message);

                var defenses = await _unitOfWork.Repository<Core.Models.Defense>()
                    .WhereAsync(x => x.CaseId == caseId, cancellationToken);

                var result = new CaseDefensesResultDto
                {
                    DefensesFormal = defenses
                        .Where(d => d.Type == Core.Enum.DefenseType.Formal)
                        .OrderByDescending(d => d.Strength)
                        .Select(MapToDefenseDetailDto)
                        .ToList(),

                    DefensesSubstantive = defenses
                        .Where(d => d.Type == Core.Enum.DefenseType.Substantive)
                        .OrderByDescending(d => d.Strength)
                        .Select(MapToDefenseDetailDto)
                        .ToList(),

                    DefensesEvidentiary = defenses
                        .Where(d => d.Type == Core.Enum.DefenseType.Evidentiary)
                        .OrderByDescending(d => d.Strength)
                        .Select(MapToDefenseDetailDto)
                        .ToList()
                };

                return Result<CaseDefensesResultDto>.Success(result, "تم جلب الدفوع بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting defenses for case {CaseId}", caseId);
                return Result<CaseDefensesResultDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب الدفوع");
            }
        }

        public async Task<Result<AnalyzeDefenseResponseDto>> AnalyzeDefenseAsync(
    AnalyzeDefenseRequestDto request,
    string userId,
    CancellationToken cancellationToken)
        {
            try
            {
                var hasTitleOverride = !string.IsNullOrWhiteSpace(request.DefenseTitle);

                if (request.DefenseId == Guid.Empty && !hasTitleOverride)
                    return Result<AnalyzeDefenseResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف الدفع غير صالح");

                Core.Models.Defense? storedDefense = null;
                Core.Models.Defense defense;
                if (hasTitleOverride)
                {
                    if (request.CaseId == Guid.Empty)
                        return Result<AnalyzeDefenseResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                    defense = new Core.Models.Defense
                    {
                        Id = request.DefenseId == Guid.Empty ? Guid.NewGuid() : request.DefenseId,
                        CaseId = request.CaseId,
                        Type = Core.Enum.DefenseType.Substantive,
                        DefenseTitle = request.DefenseTitle.Trim(),
                        BasisFromCase = request.BasisFromCase,
                        Scope = request.Scope,
                        Strength = Core.Enum.DefenseStrength.Medium
                    };
                }
                else
                {
                    storedDefense = await _unitOfWork.Repository<Core.Models.Defense>()
                        .FirstOrDefaultAsync(x => x.Id == request.DefenseId, cancellationToken);

                    if (storedDefense == null)
                        return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.NotFound, "الدفع غير موجود");

                    defense = storedDefense;
                }

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == defense.CaseId, cancellationToken, x => x.CaseType);

                if (caseEntity == null)
                    return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<AnalyzeDefenseResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var finalPrompt = await BuildDefenseAnalysisPromptAsync(defense, caseEntity, cancellationToken);
                if (finalPrompt == null)
                    return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.InternalServerError, "Defense analysis prompt file not found");

                _logger.LogInformation("Analyzing defense {DefenseId} for Case {CaseId}", request.DefenseId, defense.CaseId);

                var aiProvider = _aiProviderFactory.GetProvider();
                var defenseAnalysisModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.AnalysisDefense);
                var systemPromptContent = await _promptService.GetPromptIfExistsAsync(Path.Combine("المرحلة الأولى إعداد مذكرة الدفاع", "defense-step3-analyze-defense.txt"), cancellationToken);

                if (systemPromptContent == null)
                    return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.InternalServerError, "Defense analysis system prompt file not found");

                var aiResult = await aiProvider.SendChatCompletionAsync(
                    systemPromptContent,
                    finalPrompt,
                    AIRequestOptions.ForDefenseAnalysis with { Model = defenseAnalysisModel },
                    CancellationToken.None);

                if (!aiResult.Succeeded || string.IsNullOrWhiteSpace(aiResult.Data?.Content))
                    return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في تحليل الدفع");

                var rawResponse = aiResult.Data.Content;
                var lawyerIdStr = userId;
                var lawyerId = !string.IsNullOrEmpty(lawyerIdStr) ? Guid.Parse(lawyerIdStr) : caseEntity.LawyerId;
                await TrackUsageAsync(lawyerId, defense.CaseId, AiStepType.AnalysisDefense, defenseAnalysisModel, aiResult.Data.Usage);

                var parsedResponse = ParseDefenseAnalysisJson(rawResponse);
                if (parsedResponse == null)
                {
                    _logger.LogError("AnalyzeDefense parse returned null for {DefenseId}. Raw AI response: {Raw}", request.DefenseId, PromptService.RedactForLog(rawResponse));
                    return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في تحليل استجابة الدفع");
                }

                if (parsedResponse.Memorandum == null ||
                    (string.IsNullOrWhiteSpace(parsedResponse.Memorandum.Introduction) &&
                     string.IsNullOrWhiteSpace(parsedResponse.Memorandum.FactualBasis) &&
                     string.IsNullOrWhiteSpace(parsedResponse.Memorandum.LegalApplication)))
                {
                    _logger.LogError("AnalyzeDefense produced empty memorandum for {DefenseId}. Raw AI response: {Raw}", request.DefenseId, PromptService.RedactForLog(rawResponse));
                    return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.InternalServerError, "تحليل الدفع رجع فارغاً. برجاء إعادة المحاولة.");
                }

                parsedResponse.DefenseId = defense.Id;
                parsedResponse.ClientDefenseId = string.IsNullOrWhiteSpace(request.ClientDefenseId)
                    ? defense.Id.ToString()
                    : request.ClientDefenseId;
                parsedResponse.DefenseTitle = defense.DefenseTitle;

                if (hasTitleOverride)
                {
                    _logger.LogInformation("Analyzed transient defense title for Case {CaseId}", defense.CaseId);
                }
                else
                {
                    var freshDefense = await _unitOfWork.Repository<Core.Models.Defense>()
                        .FirstOrDefaultAsync(x => x.Id == request.DefenseId, CancellationToken.None);
                    if (freshDefense != null)
                    {
                        freshDefense.AnalysisJson = JsonSerializer.Serialize(parsedResponse, CamelCaseOptions);
                        await _unitOfWork.Repository<Core.Models.Defense>().Update(freshDefense);
                        await _unitOfWork.SaveChangesAsync(CancellationToken.None);
                    }
                    else
                    {
                        _logger.LogWarning("Defense {DefenseId} was deleted before analysis could be saved (re-generation race).", request.DefenseId);
                    }
                }

                return Result<AnalyzeDefenseResponseDto>.Success(parsedResponse, "تم تحليل الدفع القانوني بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing defense {DefenseId}", request.DefenseId);
                return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء تحليل الدفع");
            }
        }

        public async Task<Result<DefenseDetailDto>> CreateDefenseAsync(
            CreateDefenseRequestDto request,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (request.CaseId == Guid.Empty)
                    return Result<DefenseDetailDto>.Error(HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var title = request.DefenseTitle?.Trim();
                if (string.IsNullOrWhiteSpace(title))
                    return Result<DefenseDetailDto>.Error(HttpStatusCode.BadRequest, "عنوان الدفع مطلوب");

                var accessResult = await _caseAccessValidator.ValidateAsync(request.CaseId, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<DefenseDetailDto>.Error(accessResult.StatusCode, accessResult.Message);

                var defense = new Core.Models.Defense
                {
                    CaseId = request.CaseId,
                    Type = Core.Enum.DefenseType.Substantive,
                    DefenseTitle = title,
                    BasisFromCase = string.IsNullOrWhiteSpace(request.BasisFromCase)
                        ? "دفع مضاف يدويًا بواسطة المحامي"
                        : request.BasisFromCase.Trim(),
                    Scope = string.IsNullOrWhiteSpace(request.Scope)
                        ? "دفع مضاف"
                        : request.Scope.Trim(),
                    Strength = Core.Enum.DefenseStrength.Medium
                };

                await _unitOfWork.Repository<Core.Models.Defense>().AddAsync(defense);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result<DefenseDetailDto>.Success(MapToDefenseDetailDto(defense), "تمت إضافة الدفع بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating defense for Case {CaseId}", request.CaseId);
                return Result<DefenseDetailDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء إضافة الدفع");
            }
        }

        public async Task<Result<DefenseDetailDto>> UpdateDefenseTitleAsync(
            Guid defenseId,
            UpdateDefenseTitleRequestDto request,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (defenseId == Guid.Empty)
                    return Result<DefenseDetailDto>.Error(HttpStatusCode.BadRequest, "معرف الدفع غير صالح");

                var title = request.DefenseTitle?.Trim();
                if (string.IsNullOrWhiteSpace(title))
                    return Result<DefenseDetailDto>.Error(HttpStatusCode.BadRequest, "عنوان الدفع مطلوب");

                var defense = await _unitOfWork.Repository<Core.Models.Defense>()
                    .FirstOrDefaultAsync(x => x.Id == defenseId, cancellationToken);

                if (defense == null)
                    return Result<DefenseDetailDto>.Error(HttpStatusCode.NotFound, "الدفع غير موجود");

                var accessResult = await _caseAccessValidator.ValidateAsync(defense.CaseId, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<DefenseDetailDto>.Error(accessResult.StatusCode, accessResult.Message);

                defense.DefenseTitle = title;
                await _unitOfWork.Repository<Core.Models.Defense>().Update(defense);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result<DefenseDetailDto>.Success(MapToDefenseDetailDto(defense), "تم تعديل عنوان الدفع بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating defense title for Defense {DefenseId}", defenseId);
                return Result<DefenseDetailDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء تعديل عنوان الدفع");
            }
        }

        public async Task<Result<bool>> DeleteDefenseAsync(
            Guid defenseId,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (defenseId == Guid.Empty)
                    return Result<bool>.Error(HttpStatusCode.BadRequest, "معرف الدفع غير صالح");

                var defense = await _unitOfWork.Repository<Core.Models.Defense>()
                    .FirstOrDefaultAsync(x => x.Id == defenseId, cancellationToken);

                if (defense == null)
                    return Result<bool>.Error(HttpStatusCode.NotFound, "الدفع غير موجود");

                var accessResult = await _caseAccessValidator.ValidateAsync(defense.CaseId, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<bool>.Error(accessResult.StatusCode, accessResult.Message);

                _unitOfWork.Repository<Core.Models.Defense>().Delete(defense);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result<bool>.Success(true, "تم حذف الدفع بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting defense {DefenseId}", defenseId);
                return Result<bool>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء حذف الدفع");
            }
        }

        public async Task<Result<AnalyzeDefenseResponseDto>> GetDefenseAnalysisByDefenseIdAsync(
            Guid defenseId,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (defenseId == Guid.Empty)
                    return Result<AnalyzeDefenseResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف الدفع غير صالح");

                var defense = await _unitOfWork.Repository<Core.Models.Defense>()
                    .FirstOrDefaultAsync(x => x.Id == defenseId, cancellationToken);

                if (defense == null)
                    return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.NotFound, "الدفع غير موجود");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == defense.CaseId, cancellationToken, x => x.CaseType);

                if (caseEntity == null)
                    return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<AnalyzeDefenseResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                if (string.IsNullOrWhiteSpace(defense.AnalysisJson))
                    return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.NotFound, "لا يوجد تحليل محفوظ لهذا الدفع");

                var storedAnalysis = ParseDefenseAnalysisJson(defense.AnalysisJson);
                if (storedAnalysis == null)
                    return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.InternalServerError, "تعذر قراءة تحليل الدفع المحفوظ");

                storedAnalysis.DefenseId = defenseId;

                return Result<AnalyzeDefenseResponseDto>.Success(storedAnalysis, "تم جلب تحليل الدفع المحفوظ بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stored analysis for defense {DefenseId}", defenseId);
                return Result<AnalyzeDefenseResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب تحليل الدفع");
            }
        }

        public async Task<Result<FinalRequirementsResponseDto>> GenerateFinalRequirementsAsync(
            FinalRequirementsRequestDto request,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (request.CaseId == Guid.Empty)
                    return Result<FinalRequirementsResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var (caseEntity, factAnalysis, defenses) = await GetCaseWithAnalysisDataAsync(request.CaseId, cancellationToken);

                if (caseEntity == null)
                    return Result<FinalRequirementsResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<FinalRequirementsResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                if (factAnalysis == null)
                    return Result<FinalRequirementsResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "لم يتم تحليل وقائع القضية بعد");

                if (!defenses.Any())
                    return Result<FinalRequirementsResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "لم يتم توليد الدفوع بعد");

                var finalPrompt = await BuildFinalRequirementsPromptAsync(
                    caseEntity, factAnalysis, defenses, cancellationToken);

                if (finalPrompt == null)
                    return Result<FinalRequirementsResponseDto>.Error(HttpStatusCode.InternalServerError, "Final requirements prompt file not found");

                _logger.LogInformation("Generating final requirements for Case ID: {CaseId}", request.CaseId);

                var aiProvider = _aiProviderFactory.GetProvider();
                var finalReqModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.FinalRequirements);
                var systemPromptContent = await _promptService.GetPromptIfExistsAsync(Path.Combine("المرحلة الأولى إعداد مذكرة الدفاع", "defense-step4-final-requests.txt"), cancellationToken);

                if (systemPromptContent == null)
                    return Result<FinalRequirementsResponseDto>.Error(HttpStatusCode.InternalServerError, "Final requirements system prompt file not found");

                var aiResult = await aiProvider.SendChatCompletionAsync(
                    systemPromptContent,
                    finalPrompt,
                    AIRequestOptions.ForFinalRequirements with { Model = finalReqModel },
                    cancellationToken);

                if (!aiResult.Succeeded || string.IsNullOrWhiteSpace(aiResult.Data?.Content))
                    return Result<FinalRequirementsResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في توليد الطلبات النهائية");

                var rawText = aiResult.Data.Content;
                var lawyerIdStr = userId;
                var lawyerId = !string.IsNullOrEmpty(lawyerIdStr) ? Guid.Parse(lawyerIdStr) : caseEntity.LawyerId;
                await TrackUsageAsync(lawyerId, request.CaseId, AiStepType.FinalRequirements, finalReqModel, aiResult.Data.Usage);

                var parsedRequirements = ParseFinalRequirementsJson(rawText);
                if (parsedRequirements == null)
                    return Result<FinalRequirementsResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في تحليل استجابة الطلبات النهائية");

                await using var tx = await _unitOfWork.BeginTransactionAsync();

                var existingPrayers = await _unitOfWork.Repository<Core.Models.FinalPrayer>()
                    .WhereAsync(x => x.CaseId == request.CaseId, cancellationToken);

                foreach (var existing in existingPrayers)
                    _unitOfWork.Repository<Core.Models.FinalPrayer>().Delete(existing);

                var prayersToSave = parsedRequirements.FinalPrayers
                    .Select((p, index) => new Core.Models.FinalPrayer
                    {
                        CaseId = request.CaseId,
                        Level = ParseRequestLevel(p.RequestLevel),
                        RequestText = p.RequestText,
                        DisplayOrder = index
                    })
                    .ToList();

                foreach (var p in prayersToSave)
                    await _unitOfWork.Repository<Core.Models.FinalPrayer>().AddAsync(p);
                await _unitOfWork.SaveChangesAsync(CancellationToken.None);
                await tx.CommitAsync(CancellationToken.None);

                _logger.LogInformation("Saved {Count} final prayers for Case ID: {CaseId}", prayersToSave.Count, request.CaseId);

                var result = new FinalRequirementsResponseDto
                {
                    FinalPrayers = prayersToSave.Select(MapToFinalPrayerDto).ToList()
                };

                return Result<FinalRequirementsResponseDto>.Success(
                    result,
                    "تم توليد الطلبات النهائية بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating final requirements for Case {CaseId}", request.CaseId);
                return Result<FinalRequirementsResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء توليد الطلبات النهائية");
            }
        }

        public async Task<Result<DefenseMemoDraftResponseDto>> GenerateDefenseMemoDraftAsync(
            DefenseMemoDraftRequestDto request,
            string userId,
            CancellationToken ct)
        {
            try
            {
                if (request.CaseId == Guid.Empty)
                    return Result<DefenseMemoDraftResponseDto>.Error(HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == request.CaseId, ct);

                if (caseEntity == null)
                    return Result<DefenseMemoDraftResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, ct);
                if (!accessResult.Succeeded)
                    return Result<DefenseMemoDraftResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var normalizedRequest = NormalizeDefenseMemoRequest(request, caseEntity);

                var systemPrompt = await LoadDefenseMemoPromptAsync(normalizedRequest, ct);
                if (systemPrompt == null)
                    return Result<DefenseMemoDraftResponseDto>.Error(HttpStatusCode.InternalServerError, "Defense memo prompt file not found");

                var userPrompt = BuildDefenseMemoUserPrompt(normalizedRequest);

                _logger.LogInformation("Generating defense memo draft for Case ID: {CaseId}", request.CaseId);

                var aiProvider = _aiProviderFactory.GetProvider();
                var memoModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.DefenseMemoDraft);

                var aiResult = await aiProvider.SendChatCompletionAsync(
                    systemPrompt,
                    userPrompt,
                    AIRequestOptions.ForAnalysis with { Model = memoModel, MaxTokens = 32768 },
                    ct);

                if (!aiResult.Succeeded || string.IsNullOrWhiteSpace(aiResult.Data?.Content))
                    return Result<DefenseMemoDraftResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في توليد مذكرة الدفاع");

                var memoHtml = SanitizeMemoHtml(aiResult.Data.Content);

                var lawyerId = !string.IsNullOrEmpty(userId) ? Guid.Parse(userId) : caseEntity.LawyerId;
                await TrackUsageAsync(lawyerId, request.CaseId, AiStepType.DefenseMemoDraft, memoModel, aiResult.Data.Usage);

                return Result<DefenseMemoDraftResponseDto>.Success(
                    new DefenseMemoDraftResponseDto { MemoHtml = memoHtml },
                    "تم توليد مذكرة الدفاع بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating defense memo for Case {CaseId}", request.CaseId);
                return Result<DefenseMemoDraftResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء توليد مذكرة الدفاع");
            }
        }

        public async Task<Result<bool>> AbandonAnalysisAsync(Guid caseId, string lawyerId, CancellationToken ct)
        {
            try
            {
                var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                    return Result<bool>.Error(accessResult.StatusCode, accessResult.Message);

                var factAnalyses = await _unitOfWork.Repository<Core.Models.FactAnalysis>()
                    .WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var f in factAnalyses)
                    _unitOfWork.Repository<Core.Models.FactAnalysis>().Delete(f);

                var defenses = await _unitOfWork.Repository<Core.Models.Defense>()
                    .WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var d in defenses)
                    _unitOfWork.Repository<Core.Models.Defense>().Delete(d);

                var finalPrayers = await _unitOfWork.Repository<Core.Models.FinalPrayer>()
                    .WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var p in finalPrayers)
                    _unitOfWork.Repository<Core.Models.FinalPrayer>().Delete(p);

                var defenseAiStepTypes = new[] { 
                    Core.Enum.AiStepType.FactAnalysis,
                    Core.Enum.AiStepType.GenerateDefenses,
                    Core.Enum.AiStepType.AnalysisDefense,
                    Core.Enum.AiStepType.FinalRequirements,
                    Core.Enum.AiStepType.DefenseMemoDraft
                };
                var defenseAiJobs = await _unitOfWork.Repository<Core.Models.AiJob>()
                    .WhereAsync(x => x.CaseId == caseId && defenseAiStepTypes.Contains(x.StepType), ct);
                foreach (var job in defenseAiJobs)
                    _unitOfWork.Repository<Core.Models.AiJob>().Delete(job);

                await _unitOfWork.SaveChangesAsync(ct);

                return Result<bool>.Success(true, "تم إلغاء التحليل بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error abandoning analysis for Case {CaseId}", caseId);
                return Result<bool>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء إلغاء التحليل");
            }
        }

        private async Task<string?> BuildDefensesPromptAsync(
            Core.Models.Case caseEntity,
            CaseDefensesRequestDto request,
            CancellationToken cancellationToken)
        {
            var promptTemplate = await _promptService.GetPromptIfExistsAsync(
                Path.Combine("المرحلة الأولى إعداد مذكرة الدفاع", "defense-step2-generate-defenses.txt"), cancellationToken);
            if (promptTemplate == null)
                return null;

            var legalAnalysisJson = JsonSerializer.Serialize(request.LegalAnalysis, CamelCaseOptions);
            var caseTypeName = await ResolveCaseTypeNameAsync(caseEntity.CaseTypeId, cancellationToken);
            var fullCaseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseTypeName);

            return promptTemplate
                .Replace("{case_type}", caseTypeName)
                .Replace("{client_name}", caseEntity.ClientName)
                .Replace("{case_facts}", PromptService.SanitizePromptInput(request.CaseFacts))
                .Replace("{legal_analysis_json}", legalAnalysisJson)
                + $"\n\n--- بيانات القضية الكاملة ---\n{fullCaseContext}";
        }

        private Core.Models.Defense CreateDefenseEntity(Guid caseId, Core.Enum.DefenseType type, DefenseDetailDto dto)
        {
            return new Core.Models.Defense
            {
                CaseId = caseId,
                Type = type,
                DefenseTitle = dto.DefenseTitle,
                BasisFromCase = dto.BasisFromCase,
                Scope = dto.Scope,
                Strength = ParseStrength(dto.Strength)
            };
        }

        private async Task<string?> BuildDefenseAnalysisPromptAsync(
            Core.Models.Defense defense,
            Core.Models.Case caseEntity,
            CancellationToken cancellationToken)
        {
            var promptTemplate = await _promptService.GetPromptIfExistsAsync(
                Path.Combine("المرحلة الأولى إعداد مذكرة الدفاع", "defense-step3-analyze-defense.txt"), cancellationToken);
            if (promptTemplate == null)
                return null;

            var caseTypeName = await ResolveCaseTypeNameAsync(caseEntity.CaseTypeId, cancellationToken);
            var fullCaseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseTypeName);

            return promptTemplate
                .Replace("{defense_title}", defense.DefenseTitle)
                .Replace("{case_type}", caseTypeName)
                .Replace("{case_number}", caseEntity.Number)
                .Replace("{court_name}", caseEntity.Court)
                .Replace("{facts_text}", PromptService.SanitizePromptInput(caseEntity.Facts))
                + $"\n\n--- بيانات القضية الكاملة ---\n{fullCaseContext}";
        }

        private async Task<string?> BuildFinalRequirementsPromptAsync(
            Core.Models.Case caseEntity,
            Core.Models.FactAnalysis factAnalysis,
            IEnumerable<Core.Models.Defense> defenses,
            CancellationToken cancellationToken)
        {
            var promptTemplate = await _promptService.GetPromptIfExistsAsync(
                Path.Combine("المرحلة الأولى إعداد مذكرة الدفاع", "defense-step4-final-requests.txt"), cancellationToken);
            if (promptTemplate == null)
                return null;

            var caseTypeName = await ResolveCaseTypeNameAsync(caseEntity.CaseTypeId, cancellationToken);

            var legalAnalysis = new CaseAnalysisResultDto
            {
                CaseType = caseTypeName,
                CaseNumber = caseEntity.Number,
                CourtName = caseEntity.Court,
                LegalFactsSummary = JsonSerializer.Deserialize<List<string>>(factAnalysis.LegalFactsSummaryJson, CamelCaseOptions) ?? new(),
                DefendantsPositions = JsonSerializer.Deserialize<List<DefendantPositionDto>>(factAnalysis.DefendantsPositionsJson, CamelCaseOptions) ?? new(),
                EvidenceMap = JsonSerializer.Deserialize<List<EvidenceMapItemDto>>(factAnalysis.EvidenceMapJson, CamelCaseOptions) ?? new(),
                LegalAndTechnicalReviewPoints = JsonSerializer.Deserialize<List<string>>(factAnalysis.LegalAndTechnicalReviewPointsJson, CamelCaseOptions) ?? new(),
                PotentialLegalCharacterization = JsonSerializer.Deserialize<PotentialLegalCharacterizationDto>(factAnalysis.PotentialLegalCharacterizationJson, CamelCaseOptions) ?? new()
            };

            var defensesResult = new CaseDefensesResultDto
            {
                DefensesFormal = defenses
                    .Where(d => d.Type == Core.Enum.DefenseType.Formal)
                    .Select(MapToDefenseDetailDto)
                    .ToList(),
                DefensesSubstantive = defenses
                    .Where(d => d.Type == Core.Enum.DefenseType.Substantive)
                    .Select(MapToDefenseDetailDto)
                    .ToList(),
                DefensesEvidentiary = defenses
                    .Where(d => d.Type == Core.Enum.DefenseType.Evidentiary)
                    .Select(MapToDefenseDetailDto)
                    .ToList()
            };

            var legalAnalysisJson = JsonSerializer.Serialize(legalAnalysis, CamelCaseOptions);
            var defensesJson = JsonSerializer.Serialize(defensesResult, CamelCaseOptions);

            var fullCaseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseTypeName);

            return promptTemplate
                .Replace("{case_type}", caseTypeName)
                .Replace("{client_name}", caseEntity.ClientName)
                .Replace("{facts_text}", PromptService.SanitizePromptInput(caseEntity.Facts))
                .Replace("{legal_analysis_json}", legalAnalysisJson)
                .Replace("{defenses_json}", defensesJson)
                + $"\n\n--- بيانات القضية الكاملة ---\n{fullCaseContext}";
        }

        private AnalyzeDefenseResponseDto? ParseDefenseAnalysisJson(string jsonText)
        {
            try
            {
                jsonText = AnalysisHelpers.TryExtractJsonPayload(jsonText);
                
                if (!string.IsNullOrWhiteSpace(jsonText) && jsonText.TrimStart().StartsWith("["))
                {
                    try
                    {
                        var listResult = JsonSerializer.Deserialize<List<AnalyzeDefenseResponseDto>>(jsonText, DeserializeOptions);
                        if (listResult != null && listResult.Count > 0)
                            return listResult[0];
                    }
                    catch (Exception ex) { _logger.LogDebug(ex, "Fallback JSON parse failed"); }
                }

                var result = PromptService.DeserializeSnakeOrCamelJson<AnalyzeDefenseResponseDto>(jsonText);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse defense analysis JSON. Payload: {JsonText}", PromptService.RedactForLog(jsonText));
                return null;
            }
        }

        private CaseDefensesResultDto? ParseDefensesJson(string jsonText)
        {
            try
            {
                jsonText = AnalysisHelpers.TryExtractJsonPayload(jsonText);
                
                if (!string.IsNullOrWhiteSpace(jsonText) && jsonText.TrimStart().StartsWith("["))
                {
                    try
                    {
                        var listResult = JsonSerializer.Deserialize<List<CaseDefensesResultDto>>(jsonText, DeserializeOptions);
                        if (listResult != null && listResult.Count > 0)
                        {
                            return listResult[0];
                        }
                    }
                    catch (Exception ex) { _logger.LogDebug(ex, "Fallback JSON parse failed"); }
                }

                var result = PromptService.DeserializeSnakeOrCamelJson<CaseDefensesResultDto>(jsonText);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse defenses JSON. Payload: {JsonText}", PromptService.RedactForLog(jsonText));
                return null;
            }
        }

        private FinalRequirementsResponseDto? ParseFinalRequirementsJson(string jsonText)
        {
            try
            {
                jsonText = AnalysisHelpers.TryExtractJsonPayload(jsonText);
                
                if (!string.IsNullOrWhiteSpace(jsonText) && jsonText.TrimStart().StartsWith("["))
                {
                    try
                    {
                        var listResult = JsonSerializer.Deserialize<List<FinalRequirementsResponseDto>>(jsonText, DeserializeOptions);
                        if (listResult != null && listResult.Count > 0)
                            return listResult[0];
                    }
                    catch (Exception ex) { _logger.LogDebug(ex, "Fallback JSON parse failed"); }
                }

                var result = PromptService.DeserializeSnakeOrCamelJson<FinalRequirementsResponseDto>(jsonText);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse final requirements JSON. Payload: {JsonText}", PromptService.RedactForLog(jsonText));
                return null;
            }
        }

        private async Task<string?> LoadDefenseMemoPromptAsync(DefenseMemoDraftRequestDto request, CancellationToken ct)
        {
            var promptRelative = Path.Combine("المرحلة الأولى إعداد مذكرة الدفاع", "defense-step5-memo-draft.txt");
            var template = await _promptService.GetPromptIfExistsAsync(promptRelative, ct);
            if (template == null)
                return null;

            var defendedName = request.DefendingParty == "client" ? request.ClientName : request.ApponentName;
            if (string.IsNullOrWhiteSpace(defendedName))
                defendedName = request.ClientName;

            return template
                .Replace("{court_name}", request.CourtName)
                .Replace("{case_number}", request.CaseNumber)
                .Replace("{case_type}", request.CaseType)
                .Replace("{current_year}", DateTime.UtcNow.Year.ToString())
                .Replace("{defended_name}", defendedName);
        }

        private static DefenseMemoDraftRequestDto NormalizeDefenseMemoRequest(
            DefenseMemoDraftRequestDto request,
            Core.Models.Case caseEntity)
        {
            var defendingParty = IsKnownDefendingParty(caseEntity.DefendingParty)
                ? caseEntity.DefendingParty
                : IsKnownDefendingParty(request.DefendingParty)
                    ? request.DefendingParty
                    : "client";

            return new DefenseMemoDraftRequestDto
            {
                CaseId = request.CaseId,
                CaseNumber = FirstNonBlank(request.CaseNumber, caseEntity.Number),
                CaseType = FirstNonBlank(request.CaseType, caseEntity.CaseType?.Title),
                CourtName = NormalizeCourtName(FirstNonBlank(request.CourtName, caseEntity.Court)),
                ClientName = FirstNonBlank(request.ClientName, caseEntity.ClientName),
                ApponentName = FirstNonBlank(request.ApponentName, caseEntity.ApponentName),
                DefendingParty = defendingParty,
                LegalFactsSummary = request.LegalFactsSummary,
                DefendantsPositions = request.DefendantsPositions,
                ApprovedDefenses = request.ApprovedDefenses,
                FinalRequests = request.FinalRequests
            };
        }

        private static bool IsKnownDefendingParty(string? value)
            => value == "client" || value == "opponent";

        private static string FirstNonBlank(params string?[] values)
            => values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v))?.Trim() ?? string.Empty;

        private static string NormalizeCourtName(string? value)
        {
            var trimmed = value?.Trim() ?? string.Empty;
            return trimmed == "بدون محكمة" ? string.Empty : trimmed;
        }

        private static string BuildDefenseMemoUserPrompt(DefenseMemoDraftRequestDto request)
        {
            var sb = new StringBuilder();

            sb.AppendLine("بيانات القضية:");
            sb.AppendLine($"- رقم القضية: {request.CaseNumber}");
            sb.AppendLine($"- نوع القضية: {request.CaseType}");
            sb.AppendLine($"- المحكمة: {request.CourtName}");
            sb.AppendLine($"- الموكل: {request.ClientName}");
            sb.AppendLine($"- الخصم: {request.ApponentName}");
            sb.AppendLine($"- المدافع عن: {(request.DefendingParty == "client" ? "الموكل" : "الخصم")}");
            sb.AppendLine();

            if (request.LegalFactsSummary?.Count > 0)
            {
                sb.AppendLine("ملخص الوقائع القانونية:");
                foreach (var fact in request.LegalFactsSummary)
                    sb.AppendLine($"- {fact}");
                sb.AppendLine();
            }

            if (request.DefendantsPositions?.Count > 0)
            {
                sb.AppendLine("مواقف الخصوم:");
                foreach (var pos in request.DefendantsPositions)
                    sb.AppendLine($"- {pos.DefendantName} ({pos.RelationshipToClient}): {pos.PositionSummary}");
                sb.AppendLine();
            }

            if (request.ApprovedDefenses?.Count > 0)
            {
                sb.AppendLine("الدفوع المعتمدة مع التحليل:");
                foreach (var defense in request.ApprovedDefenses)
                {
                    sb.AppendLine($"### الدفع: {defense.DefenseTitle}");
                    sb.AppendLine($"- النوع: {defense.Type}");
                    sb.AppendLine($"- الأساس: {defense.BasisFromCase}");

                    if (defense.Explanation != null)
                    {
                        var exp = defense.Explanation;
                        if (!string.IsNullOrEmpty(exp.Introduction))
                            sb.AppendLine($"- التأصيل القانوني: {exp.Introduction}");
                        if (!string.IsNullOrEmpty(exp.FactualBasis))
                            sb.AppendLine($"- الأساس الواقعي: {exp.FactualBasis}");

                        if (exp.LegalTexts?.Count > 0)
                        {
                            sb.AppendLine("- النصوص القانونية:");
                            foreach (var text in exp.LegalTexts)
                                sb.AppendLine($"  * {text.LawName} - المادة {text.ArticleNumber}: {text.FullText}");
                        }

                        if (!string.IsNullOrEmpty(exp.LinkingTextsToFacts))
                            sb.AppendLine($"- ربط النصوص بالوقائع: {exp.LinkingTextsToFacts}");

                        if (exp.CassationPrecedents?.Count > 0)
                        {
                            sb.AppendLine("- السوابق القضائية:");
                            foreach (var prec in exp.CassationPrecedents)
                                sb.AppendLine($"  * طعن {prec.AppealNumber} لسنة {prec.JudicialYear} ({prec.SessionDate}): {prec.FullText}");
                        }

                        if (!string.IsNullOrEmpty(exp.LegalApplication))
                            sb.AppendLine($"- التطبيق القانوني: {exp.LegalApplication}");
                        if (!string.IsNullOrEmpty(exp.CounterArguments))
                            sb.AppendLine($"- الرد على الحجج المضادة: {exp.CounterArguments}");
                        if (!string.IsNullOrEmpty(exp.LegalEffectOfAcceptance))
                            sb.AppendLine($"- الأثر القانوني للقبول: {exp.LegalEffectOfAcceptance}");
                    }
                    sb.AppendLine();
                }
            }

            if (request.FinalRequests?.Count > 0)
            {
                sb.AppendLine("الطلبات النهائية:");
                foreach (var req in request.FinalRequests)
                    sb.AppendLine($"- [{req.RequestLevel}] {req.RequestText}");
            }

            return sb.ToString();
        }

        private static string SanitizeMemoHtml(string html)
        {
            if (string.IsNullOrWhiteSpace(html))
                return string.Empty;

            var sanitized = html.Trim();

            sanitized = Regex.Replace(
                sanitized,
                @"\b(Gemini|Google Gemini|Claude|OpenAI|ChatGPT|DeepSeek|Deep Seek|LLM|AI model|language model|جميناي|جيمناي|جيمني|شات جي بي تي|شاتGPT|كلود|ديب سيك)\b",
                string.Empty,
                RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

            sanitized = Regex.Replace(
                sanitized,
                @"\b(أنا\s+(?:نموذج|موديل|ذكاء اصطناعي|مساعد)\s+تابع\s+لـ?\s*[^\r\n\.\،,]+)",
                string.Empty,
                RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

            sanitized = Regex.Replace(sanitized, @"```[\s\S]*?```", string.Empty);
            sanitized = Regex.Replace(sanitized, @"`([^`]+)`", "$1");

            sanitized = Regex.Replace(sanitized, @"^#{1,6}\s+", string.Empty, RegexOptions.Multiline);
            sanitized = Regex.Replace(sanitized, @"\*\*(.+?)\*\*", "<strong>$1</strong>");
            sanitized = Regex.Replace(sanitized, @"(?<!<strong>)\*(.+?)\*(?!</strong>)", "$1");

            return sanitized.Trim();
        }
    }
}
