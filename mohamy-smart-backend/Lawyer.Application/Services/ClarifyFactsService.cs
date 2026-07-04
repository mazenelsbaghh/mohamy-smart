using Lawyer.Application.Common;
using Lawyer.Application.Dtos.Case;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class ClarifyFactsService : IClarifyFactsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ClarifyFactsService> _logger;
        private readonly IAIProviderFactory _aiProviderFactory;
        private readonly string _contentRootPath;
        private readonly ICaseAccessValidator _caseAccessValidator;
        private readonly IAiUsageTrackingService _trackingService;
        private readonly IAiPointAccountingService _pointAccounting;
        private readonly PromptTemplateCache _promptCache;

        private static readonly JsonSerializerOptions DeserializeOptions = Common.JsonOptions.Deserialize;

        public ClarifyFactsService(
            IUnitOfWork unitOfWork,
            ILogger<ClarifyFactsService> logger,
            IAIProviderFactory aiProviderFactory,
            IConfiguration config,
            ICaseAccessValidator caseAccessValidator,
            IAiUsageTrackingService trackingService,
            IAiPointAccountingService pointAccounting,
            PromptTemplateCache promptCache)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _aiProviderFactory = aiProviderFactory;
            _contentRootPath = config.GetValue<string>(WebHostDefaults.ContentRootKey)
                               ?? Directory.GetCurrentDirectory();
            _caseAccessValidator = caseAccessValidator;
            _trackingService = trackingService;
            _pointAccounting = pointAccounting;
            _promptCache = promptCache;
        }

        public async Task<Result<ClarifyFactsResponseDto>> EvaluateFactsGapsAsync(
            ClarifyFactsRequestDto request,
            string lawyerId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (request.CaseId == Guid.Empty)
                    return Result<ClarifyFactsResponseDto>.Error(HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == request.CaseId, cancellationToken, x => x.CaseType);

                if (caseEntity == null)
                    return Result<ClarifyFactsResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(
                    caseEntity.Id, lawyerId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<ClarifyFactsResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                // Build case context for the AI
                var caseTypeName = caseEntity.CaseType?.Title ?? string.Empty;
                var caseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseTypeName);

                // Load the clarify-facts prompt template
                var promptPath = Path.Combine(_contentRootPath, "wwwroot", "prompts", "Global", "clarify-facts.txt");
                if (!File.Exists(promptPath))
                {
                    _logger.LogError("Clarify-facts prompt file not found at {Path}", promptPath);
                    return Result<ClarifyFactsResponseDto>.Error(HttpStatusCode.InternalServerError, "ملف البرومبت غير موجود");
                }

                var promptTemplate = await _promptCache.GetAsync(Path.Combine("Global", "clarify-facts.txt"), cancellationToken);
                var systemPrompt = promptTemplate.Replace("{case_data}", caseContext);

                _logger.LogInformation("Evaluating facts gaps for Case {CaseId}", request.CaseId);

                // Call the AI — the full prompt (with case data embedded) goes as the system prompt,
                // and the user message triggers execution.
                var aiProvider = _aiProviderFactory.GetProvider();
                var model = await _aiProviderFactory.GetModelForStepAsync(AiStepType.ClarifyFacts);
                var aiResult = await aiProvider.SendChatCompletionAsync(
                    systemPrompt,
                    "Analyze the case data provided above and generate the clarification questions JSON as instructed.",
                    AIRequestOptions.Default with
                    {
                        Temperature = 0.1f,
                        MaxTokens = AIRequestOptions.GeminiMaxOutputTokens,
                        Model = model,
                        StepType = AiStepType.ClarifyFacts
                    },
                    cancellationToken);

                if (!aiResult.Succeeded || string.IsNullOrWhiteSpace(aiResult.Data?.Content))
                {
                    _logger.LogWarning("AI failed to evaluate facts gaps for Case {CaseId}", request.CaseId);
                    return Result<ClarifyFactsResponseDto>.Error(
                        HttpStatusCode.InternalServerError, "فشل في تقييم اكتمال الوقائع");
                }

                await _trackingService.RecordGeminiUsageAsync(caseEntity.LawyerId, caseEntity.Id, AiStepType.ClarifyFacts, model, aiResult.Data.Usage, CancellationToken.None);

                var cleanedJson = AnalysisHelpers.TryExtractJsonPayload(aiResult.Data.Content);
                var parsed = ParseClarifyResponse(cleanedJson);

                if (parsed == null)
                {
                    _logger.LogWarning("Failed to parse clarify-facts AI response for Case {CaseId}. Raw: {Raw}",
                        request.CaseId, RedactForLog(aiResult.Data?.Content ?? string.Empty));
                    return Result<ClarifyFactsResponseDto>.Error(
                        HttpStatusCode.InternalServerError, "فشل في تحليل استجابة الذكاء الاصطناعي");
                }

                var chargeResult = await _pointAccounting.ChargeSuccessfulDirectActionAsync(
                    caseEntity.LawyerId,
                    AiStepType.ClarifyFacts,
                    _pointAccounting.ResolvePointCost(AiStepType.ClarifyFacts),
                    caseEntity.Id,
                    "clarify-facts",
                    null,
                    "تم خصم نقطة واحدة بعد مراجعة الوقائع واستيضاح الأسئلة بنجاح.",
                    cancellationToken);

                if (!chargeResult.Succeeded)
                {
                    return Result<ClarifyFactsResponseDto>.Error(
                        chargeResult.StatusCode,
                        chargeResult.Message ?? "تعذر خصم نقاط مراجعة الوقائع");
                }

                _logger.LogInformation("Facts gap evaluation completed for Case {CaseId}. Questions count: {Count}",
                    request.CaseId, parsed.Questions.Count);

                return Result<ClarifyFactsResponseDto>.Success(parsed, "تم تقييم اكتمال الوقائع بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evaluating facts gaps for Case {CaseId}", request.CaseId);
                return Result<ClarifyFactsResponseDto>.Error(
                    HttpStatusCode.InternalServerError, "حدث خطأ أثناء تقييم اكتمال الوقائع");
            }
        }

        private ClarifyFactsResponseDto? ParseClarifyResponse(string jsonText)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(jsonText))
                    return new ClarifyFactsResponseDto();

                using var doc = JsonDocument.Parse(jsonText);
                var root = doc.RootElement;

                var response = new ClarifyFactsResponseDto();

                if (!root.TryGetProperty("questions", out var questionsElement))
                    return response;

                foreach (var q in questionsElement.EnumerateArray())
                {
                    // Handle the new format: { questionText: "...", suggestedOptions: [...] }
                    if (q.ValueKind == JsonValueKind.Object)
                    {
                        var questionDto = new ClarifyFactsQuestionDto();

                        if (q.TryGetProperty("questionText", out var qt))
                            questionDto.QuestionText = qt.GetString() ?? string.Empty;
                        else if (q.TryGetProperty("question_text", out var qt2))
                            questionDto.QuestionText = qt2.GetString() ?? string.Empty;

                        if (q.TryGetProperty("suggestedOptions", out var opts))
                        {
                            foreach (var opt in opts.EnumerateArray())
                                questionDto.SuggestedOptions.Add(opt.GetString() ?? string.Empty);
                        }
                        else if (q.TryGetProperty("suggested_options", out var opts2))
                        {
                            foreach (var opt in opts2.EnumerateArray())
                                questionDto.SuggestedOptions.Add(opt.GetString() ?? string.Empty);
                        }

                        if (!string.IsNullOrWhiteSpace(questionDto.QuestionText))
                            response.Questions.Add(questionDto);
                    }
                    // Fallback: handle old simple string array format (just in case)
                    else if (q.ValueKind == JsonValueKind.String)
                    {
                        var text = q.GetString();
                        if (!string.IsNullOrWhiteSpace(text))
                        {
                            response.Questions.Add(new ClarifyFactsQuestionDto
                            {
                                QuestionText = text,
                                SuggestedOptions = new List<string>()
                            });
                        }
                    }
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse clarify-facts JSON. Payload: {JsonText}", RedactForLog(jsonText));
                return null;
            }
        }

        private static string RedactForLog(string raw)
        {
            if (string.IsNullOrEmpty(raw)) return "(empty)";
            var preview = raw[..Math.Min(500, raw.Length)];
            var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw)))[..16];
            return $"{preview}... [SHA256:{hash}] (len={raw.Length})";
        }
    }
}
