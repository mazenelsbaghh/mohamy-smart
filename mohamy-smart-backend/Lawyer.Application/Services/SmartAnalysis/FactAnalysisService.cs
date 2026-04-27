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
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Lawyer.Application.Services.SmartAnalysis
{
    public class FactAnalysisService : IFactAnalysisService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<FactAnalysisService> _logger;
        private readonly IAIProviderFactory _aiProviderFactory;
        private readonly ICaseAccessValidator _caseAccessValidator;
        private readonly IAiUsageTrackingService _trackingService;
        private readonly IPromptService _promptService;
        private readonly IBackgroundJobClient? _backgroundJobs;

        private static readonly JsonSerializerOptions CamelCaseOptions = Common.JsonOptions.Serialize;
        private static readonly JsonSerializerOptions DeserializeOptions = Common.JsonOptions.Deserialize;

        public FactAnalysisService(
            IUnitOfWork unitOfWork,
            ILogger<FactAnalysisService> logger,
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

        private string TrimOutputString(string? value, string field)
        {
            if (string.IsNullOrEmpty(value)) return value ?? string.Empty;
            if (value.Length <= PromptService.MaxOutputStringLength) return value;
            _logger.LogWarning("Output field {Field} exceeded {Limit} chars (got {Length}); truncating.", field, PromptService.MaxOutputStringLength, value.Length);
            return value[..PromptService.MaxOutputStringLength];
        }

        private List<string> TrimOutputList(List<string> list, string field)
        {
            if (list == null) return new List<string>();
            if (list.Count > PromptService.MaxOutputListLength)
            {
                _logger.LogWarning("Output list {Field} exceeded {Limit} items (got {Count}); truncating.", field, PromptService.MaxOutputListLength, list.Count);
                list = list.Take(PromptService.MaxOutputListLength).ToList();
            }
            return list.Select(s => TrimOutputString(s, field)).ToList();
        }

        public async Task<Result<CaseAnalysisResultDto>> AnalyzeCaseFactsAsync(CaseAnalysisRequestDto request, string userId, CancellationToken cancellationToken)
        {
            try
            {
                if (request.CaseId == Guid.Empty)
                {
                    return Result<CaseAnalysisResultDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");
                }

             if(request.CaseFacts == null || request.CaseFacts.Trim().Length == 0)
                {
                    return Result<CaseAnalysisResultDto>.Error(System.Net.HttpStatusCode.BadRequest, "وقائع القضية مطلوبة");
                }


             var caseEntity = await _unitOfWork.Repository<Core.Models.Case>().FirstOrDefaultAsync(x=>x.Id==request.CaseId, cancellationToken, x => x.CaseType);
                if(caseEntity == null)
                {
                    return Result<CaseAnalysisResultDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");
                }

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<CaseAnalysisResultDto>.Error(accessResult.StatusCode, accessResult.Message);

                var caseTypeName = await ResolveCaseTypeNameAsync(caseEntity.CaseTypeId, cancellationToken);

                var fullCaseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseTypeName);

                var promptRelative = Path.Combine("المرحلة الأولى إعداد مذكرة الدفاع", "defense-step1-legal-analysis.txt");
                var promptTemplate = await _promptService.GetPromptIfExistsAsync(promptRelative, cancellationToken);
                if (promptTemplate == null)
                    return Result<CaseAnalysisResultDto>.Error(HttpStatusCode.InternalServerError, "Prompt file not found");

                _logger.LogInformation("Sending analysis request for Case ID: {CaseId}", request.CaseId);

         var finalPrompt = promptTemplate
        .Replace("{case_type}", caseTypeName)
        .Replace("{client_name}", caseEntity.ClientName ?? "موكلنا")
        .Replace("{opponent_name}", caseEntity.ApponentName ?? "الخصم")
        .Replace("{parties}", $"الموكل: {caseEntity.ClientName ?? "لم يُحدَّد"} — الخصم: {caseEntity.ApponentName ?? "لم يُحدَّد"}")
        .Replace("{facts_text}", PromptService.SanitizePromptInput(request.CaseFacts))
        + $"\n\n--- بيانات القضية الكاملة ---\n{fullCaseContext}";

                var aiProvider = _aiProviderFactory.GetProvider();
                var analysisModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.FactAnalysis);

                var aiResult = await aiProvider.SendChatCompletionAsync(
                    finalPrompt,
                    "Analyze the case documents mapped above and produce the requested JSON based on the specified format and rules.",
                    AIRequestOptions.ForAnalysis with { Model = analysisModel },
                    cancellationToken);

                if (!aiResult.Succeeded || string.IsNullOrWhiteSpace(aiResult.Data?.Content))
                    return Result<CaseAnalysisResultDto>.Error(HttpStatusCode.InternalServerError, "Failed to generate analysis");

                var analysis = aiResult.Data.Content;
                var lawyerIdStr = userId;
                var lawyerId = !string.IsNullOrEmpty(lawyerIdStr) ? Guid.Parse(lawyerIdStr) : caseEntity.LawyerId;
                await TrackUsageAsync(lawyerId, request.CaseId, AiStepType.FactAnalysis, analysisModel, aiResult.Data.Usage);

                var parsedResult = ParseCaseAnalysisJson(analysis);
                if (parsedResult == null)
                    return Result<CaseAnalysisResultDto>.Error(HttpStatusCode.InternalServerError, "Failed to parse analysis response");

                parsedResult.LegalFactsSummary = parsedResult.LegalFactsSummary
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Select(s => s.Trim())
                    .ToList();
                parsedResult.LegalAndTechnicalReviewPoints = parsedResult.LegalAndTechnicalReviewPoints
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Select(s => s.Trim())
                    .ToList();
                parsedResult.PotentialLegalCharacterization.ElementsReliedUpon = parsedResult.PotentialLegalCharacterization.ElementsReliedUpon
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Select(s => s.Trim())
                    .ToList();
                parsedResult.PotentialLegalCharacterization.ElementsLackingProof = parsedResult.PotentialLegalCharacterization.ElementsLackingProof
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Select(s => s.Trim())
                    .ToList();

                parsedResult.LegalFactsSummary = TrimOutputList(parsedResult.LegalFactsSummary, nameof(parsedResult.LegalFactsSummary));
                parsedResult.LegalAndTechnicalReviewPoints = TrimOutputList(parsedResult.LegalAndTechnicalReviewPoints, nameof(parsedResult.LegalAndTechnicalReviewPoints));
                parsedResult.PotentialLegalCharacterization.ElementsReliedUpon = TrimOutputList(parsedResult.PotentialLegalCharacterization.ElementsReliedUpon, "ElementsReliedUpon");
                parsedResult.PotentialLegalCharacterization.ElementsLackingProof = TrimOutputList(parsedResult.PotentialLegalCharacterization.ElementsLackingProof, "ElementsLackingProof");

                parsedResult.CaseType = string.IsNullOrWhiteSpace(parsedResult.CaseType) ? caseTypeName : parsedResult.CaseType;
                parsedResult.CaseNumber = string.IsNullOrWhiteSpace(parsedResult.CaseNumber) ? caseEntity.Number : parsedResult.CaseNumber;
                parsedResult.CourtName = string.IsNullOrWhiteSpace(parsedResult.CourtName) ? caseEntity.Court : parsedResult.CourtName;

                if (!HasRequiredCaseAnalysisSections(parsedResult))
                {
                    _logger.LogWarning("Parsed fact analysis was structurally incomplete for Case ID: {CaseId}. Raw AI payload: {Analysis}", request.CaseId, PromptService.RedactForLog(analysis));
                    return Result<CaseAnalysisResultDto>.Error(HttpStatusCode.InternalServerError, "Returned analysis payload was incomplete");
                }

                if (IsEmptyCaseAnalysisContent(parsedResult))
                {
                    _logger.LogWarning("Parsed fact analysis was empty for Case ID: {CaseId}. Raw AI payload: {Analysis}", request.CaseId, PromptService.RedactForLog(analysis));
                    return Result<CaseAnalysisResultDto>.Error(HttpStatusCode.InternalServerError, "Returned analysis payload was empty");
                }

                await using var tx = await _unitOfWork.BeginTransactionAsync();

                var existingFactAnalysis = await _unitOfWork.Repository<Core.Models.FactAnalysis>()
                    .WhereAsync(x => x.CaseId == request.CaseId, cancellationToken);

                foreach (var existing in existingFactAnalysis)
                    _unitOfWork.Repository<Core.Models.FactAnalysis>().Delete(existing);

                var factAnalysis = new Core.Models.FactAnalysis
                {
                    CaseId = request.CaseId,
                    LegalFactsSummaryJson = JsonSerializer.Serialize(parsedResult.LegalFactsSummary, CamelCaseOptions),
                    DefendantsPositionsJson = JsonSerializer.Serialize(parsedResult.DefendantsPositions, CamelCaseOptions),
                    EvidenceMapJson = JsonSerializer.Serialize(parsedResult.EvidenceMap, CamelCaseOptions),
                    LegalAndTechnicalReviewPointsJson = JsonSerializer.Serialize(parsedResult.LegalAndTechnicalReviewPoints, CamelCaseOptions),
                    PotentialLegalCharacterizationJson = JsonSerializer.Serialize(parsedResult.PotentialLegalCharacterization, CamelCaseOptions)
                };

                await _unitOfWork.Repository<Core.Models.FactAnalysis>().AddAsync(factAnalysis);
                await _unitOfWork.SaveChangesAsync(CancellationToken.None);
                await tx.CommitAsync(CancellationToken.None);

                _logger.LogInformation("Analysis completed and saved for Case ID: {CaseId}", request.CaseId);

             return Result<CaseAnalysisResultDto>.Success(parsedResult, "تم تحليل القضية بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing case {CaseId}", request.CaseId);
               return Result<CaseAnalysisResultDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء تحليل القضية");
            }
        }

        public async Task<Result<CaseAnalysisResultDto>> GetFactAnalysisByCaseIdAsync(Guid caseId, string userId, CancellationToken cancellationToken)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<CaseAnalysisResultDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == caseId, cancellationToken);

                if (caseEntity == null)
                    return Result<CaseAnalysisResultDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<CaseAnalysisResultDto>.Error(accessResult.StatusCode, accessResult.Message);

                var factAnalysis = await _unitOfWork.Repository<Core.Models.FactAnalysis>()
                    .FirstOrDefaultAsync(x => x.CaseId == caseId, cancellationToken);

                if (factAnalysis == null)
                    return Result<CaseAnalysisResultDto>.Error(HttpStatusCode.NotFound, "لا يوجد تحليل لهذه القضية");

                var caseTypeName = await ResolveCaseTypeNameAsync(caseEntity.CaseTypeId, cancellationToken);

                var result = new CaseAnalysisResultDto
                {
                    CaseType = caseTypeName,
                    CaseNumber = caseEntity.Number,
                    CourtName = caseEntity.Court,
                    LegalFactsSummary = JsonSerializer.Deserialize<List<string>>(factAnalysis.LegalFactsSummaryJson, CamelCaseOptions) ?? new List<string>(),
                    DefendantsPositions = JsonSerializer.Deserialize<List<DefendantPositionDto>>(factAnalysis.DefendantsPositionsJson, CamelCaseOptions) ?? new List<DefendantPositionDto>(),
                    EvidenceMap = JsonSerializer.Deserialize<List<EvidenceMapItemDto>>(factAnalysis.EvidenceMapJson, CamelCaseOptions) ?? new List<EvidenceMapItemDto>(),
                    LegalAndTechnicalReviewPoints = JsonSerializer.Deserialize<List<string>>(factAnalysis.LegalAndTechnicalReviewPointsJson, CamelCaseOptions) ?? new List<string>(),
                    PotentialLegalCharacterization = JsonSerializer.Deserialize<PotentialLegalCharacterizationDto>(factAnalysis.PotentialLegalCharacterizationJson, CamelCaseOptions) ?? new PotentialLegalCharacterizationDto()
                };

                return Result<CaseAnalysisResultDto>.Success(result, "تم جلب التحليل بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting fact analysis for case {CaseId}", caseId);
                return Result<CaseAnalysisResultDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب التحليل");
            }
        }

        private CaseAnalysisResultDto? ParseCaseAnalysisJson(string jsonText)
        {
            try
            {
                jsonText = AnalysisHelpers.TryExtractJsonPayload(jsonText);
                
                if (!string.IsNullOrWhiteSpace(jsonText) && jsonText.TrimStart().StartsWith("["))
                {
                    var stringListFallback = TryParseCaseAnalysisStringArray(jsonText);
                    if (!IsEmptyCaseAnalysisContent(stringListFallback))
                    {
                        return stringListFallback;
                    }

                    try
                    {
                        var listResult = JsonSerializer.Deserialize<List<CaseAnalysisResultDto>>(jsonText, DeserializeOptions);
                        if (listResult != null && listResult.Count > 0)
                        {
                            return listResult[0];
                        }
                    }
                    catch (Exception ex) { _logger.LogDebug(ex, "Fallback parse failed"); }
                }

                CaseAnalysisResultDto? result = null;
                try
                {
                    result = JsonSerializer.Deserialize<CaseAnalysisResultDto>(jsonText, DeserializeOptions);
                }
                catch (Exception ex) { _logger.LogDebug(ex, "Fallback parse failed"); }

                if (!IsEmptyCaseAnalysis(result))
                {
                    return result;
                }

                result = PromptService.DeserializeSnakeOrCamelJson<CaseAnalysisResultDto>(jsonText);
                if (!IsEmptyCaseAnalysis(result))
                {
                    return result;
                }

                var root = JsonNode.Parse(jsonText);
                if (root is JsonObject obj)
                {
                    foreach (var key in new[] { "data", "result", "analysis", "factAnalysis", "caseAnalysis", "payload" })
                    {
                        if (obj.TryGetPropertyValue(key, out var wrappedNode) && wrappedNode is not null)
                        {
                            if (wrappedNode is JsonArray wrappedArray)
                            {
                                var wrappedArrayFallback = TryParseCaseAnalysisStringArray(wrappedArray.ToJsonString());
                                if (!IsEmptyCaseAnalysisContent(wrappedArrayFallback))
                                {
                                    return wrappedArrayFallback;
                                }
                            }

                            var wrappedJson = wrappedNode.ToJsonString();
                            CaseAnalysisResultDto? wrappedResult = null;
                            try { wrappedResult = JsonSerializer.Deserialize<CaseAnalysisResultDto>(wrappedJson, DeserializeOptions); } catch (Exception ex) { _logger.LogDebug(ex, "Fallback parse failed"); }
                            if (!IsEmptyCaseAnalysis(wrappedResult))
                                return wrappedResult;
                            wrappedResult = PromptService.DeserializeSnakeOrCamelJson<CaseAnalysisResultDto>(wrappedJson);
                            if (!IsEmptyCaseAnalysis(wrappedResult))
                                return wrappedResult;
                        }
                    }

                    foreach (var property in obj)
                    {
                        if (property.Value is not JsonObject nestedObject) continue;

                        var nestedJson = nestedObject.ToJsonString();
                        CaseAnalysisResultDto? nestedResult = null;
                        try { nestedResult = JsonSerializer.Deserialize<CaseAnalysisResultDto>(nestedJson, DeserializeOptions); } catch (Exception ex) { _logger.LogDebug(ex, "Fallback parse failed"); }
                        if (!IsEmptyCaseAnalysis(nestedResult))
                            return nestedResult;
                        nestedResult = PromptService.DeserializeSnakeOrCamelJson<CaseAnalysisResultDto>(nestedJson);
                        if (!IsEmptyCaseAnalysis(nestedResult))
                            return nestedResult;
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse case analysis JSON. Payload: {JsonText}", PromptService.RedactForLog(jsonText));
                return null;
            }
        }

        private static CaseAnalysisResultDto? TryParseCaseAnalysisStringArray(string jsonText)
        {
            try
            {
                var facts = JsonSerializer.Deserialize<List<string>>(jsonText, DeserializeOptions);
                if (facts == null || facts.Count == 0)
                {
                    return null;
                }

                var normalizedFacts = facts
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Select(s => s.Trim())
                    .ToList();

                if (normalizedFacts.Count == 0)
                {
                    return null;
                }

                return new CaseAnalysisResultDto
                {
                    LegalFactsSummary = normalizedFacts
                };
            }
            catch
            {
                return null;
            }
        }

        private static bool IsEmptyCaseAnalysis(CaseAnalysisResultDto? result)
        {
            if (result == null) return true;

            return string.IsNullOrWhiteSpace(result.CaseType)
                && string.IsNullOrWhiteSpace(result.CaseNumber)
                && string.IsNullOrWhiteSpace(result.CourtName)
                && !result.LegalFactsSummary.Any()
                && !result.DefendantsPositions.Any()
                && !result.EvidenceMap.Any()
                && !result.LegalAndTechnicalReviewPoints.Any()
                && string.IsNullOrWhiteSpace(result.PotentialLegalCharacterization?.ChargeDescription)
                && !(result.PotentialLegalCharacterization?.ElementsReliedUpon?.Any() ?? false)
                && !(result.PotentialLegalCharacterization?.ElementsLackingProof?.Any() ?? false);
        }

        private static bool IsEmptyCaseAnalysisContent(CaseAnalysisResultDto? result)
        {
            if (result == null) return true;

            return !result.LegalFactsSummary.Any()
                && !result.DefendantsPositions.Any()
                && !result.EvidenceMap.Any()
                && !result.LegalAndTechnicalReviewPoints.Any()
                && string.IsNullOrWhiteSpace(result.PotentialLegalCharacterization?.ChargeDescription)
                && !(result.PotentialLegalCharacterization?.ElementsReliedUpon?.Any() ?? false)
                && !(result.PotentialLegalCharacterization?.ElementsLackingProof?.Any() ?? false);
        }

        private static bool HasRequiredCaseAnalysisSections(CaseAnalysisResultDto? result)
        {
            if (result == null)
            {
                return false;
            }

            return result.LegalFactsSummary.Any()
                && result.DefendantsPositions.Any()
                && result.EvidenceMap.Any()
                && result.LegalAndTechnicalReviewPoints.Any();
        }
    }
}
