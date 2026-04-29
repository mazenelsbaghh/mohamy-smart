using Lawyer.Application.Common;
using Lawyer.Application.Dtos.PreparingStatementOfClaims;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using System.Net;
using System.Text.Json;
using Lawyer.Core.IRepositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json.Nodes;
using static Lawyer.Application.Common.AnalysisHelpers;

namespace Lawyer.Application.Services
{
    public class PreparingStatementOfClaimsService : IPreparingStatementOfClaimsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<PreparingStatementOfClaimsService> _logger;
        private readonly IAIProviderFactory _aiProviderFactory;
        private readonly string _contentRootPath;
        private readonly ICaseAccessValidator _caseAccessValidator;
        private readonly IAiUsageTrackingService _trackingService;
        private readonly PromptTemplateCache _promptCache;

        private static readonly JsonSerializerOptions SnakeCaseOptions = Common.JsonOptions.Deserialize;

        // System prompts are loaded dynamically from files

        public PreparingStatementOfClaimsService(
            IUnitOfWork unitOfWork,
            ILogger<PreparingStatementOfClaimsService> logger,
            IAIProviderFactory aiProviderFactory,
            IConfiguration config,
            ICaseAccessValidator caseAccessValidator,
            IAiUsageTrackingService trackingService,
            PromptTemplateCache promptCache)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _aiProviderFactory = aiProviderFactory;
            _contentRootPath = config.GetValue<string>(WebHostDefaults.ContentRootKey)
                                   ?? Directory.GetCurrentDirectory();
            _caseAccessValidator = caseAccessValidator;
            _trackingService = trackingService;
            _promptCache = promptCache;
        }

        private async Task<string> ResolveCaseTypeNameAsync(int caseTypeId, CancellationToken cancellationToken)
        {
            var caseType = await _unitOfWork.Repository<Core.Models.CaseType>()
                .FirstOrDefaultAsync(x => x.Id == caseTypeId, cancellationToken);
            return caseType?.Title ?? string.Empty;
        }

        private static string SnakeToCamel(string key)
        {
            if (string.IsNullOrWhiteSpace(key) || !key.Contains('_'))
                return key;

            var parts = key.Split('_', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 0) return key;

            return parts[0] + string.Concat(parts.Skip(1).Select(part =>
                char.ToUpperInvariant(part[0]) + part.Substring(1)));
        }

        private static JsonNode? NormalizeJsonKeys(JsonNode? node)
        {
            return node switch
            {
                null => null,
                JsonObject obj => new JsonObject(
                    obj.Select(kvp => new KeyValuePair<string, JsonNode?>(
                        SnakeToCamel(kvp.Key),
                        NormalizeJsonKeys(kvp.Value)))
                ),
                JsonArray array => new JsonArray(array.Select(NormalizeJsonKeys).ToArray()),
                _ => node.DeepClone()
            };
        }

        private T? DeserializeSnakeOrCamelJson<T>(string jsonText) where T : class
        {
            jsonText = CleanJsonResponse(jsonText);

            var node = JsonNode.Parse(jsonText);
            var normalized = NormalizeJsonKeys(node);
            if (normalized is null)
                return null;

            return normalized.Deserialize<T>(SnakeCaseOptions);
        }



        public async Task<Result<LawSuitCaseTypeResponseDto>> ClassifyLawSuitCaseTypeAsync(
            LawSuitCaseTypeRequestDto request,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (request.CaseId == Guid.Empty)
                    return Result<LawSuitCaseTypeResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == request.CaseId, cancellationToken, x => x.CaseType);

                if (caseEntity == null)
                    return Result<LawSuitCaseTypeResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<LawSuitCaseTypeResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                // Build prompt with case data
                var promptTemplatePath = Path.Combine(_contentRootPath, "wwwroot", "prompts", "المرحلة الثانية إعداد صحيفة الدعوى", "lawsuit-step1-case-type.txt");
                if (!File.Exists(promptTemplatePath))
                    return Result<LawSuitCaseTypeResponseDto>.Error(HttpStatusCode.InternalServerError, "Prompt file not found");

                var promptTemplate = await _promptCache.GetAsync(Path.GetRelativePath(Path.Combine(_contentRootPath, "wwwroot", "prompts"), promptTemplatePath), cancellationToken);

                // Build user input with case data
                var caseTypeName = await ResolveCaseTypeNameAsync(caseEntity.CaseTypeId, cancellationToken);
                var fullCaseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseTypeName);

                var finalPrompt = $"{promptTemplate}\n\n--- بيانات القضية الكاملة ---\n{fullCaseContext}";

                _logger.LogInformation("Classifying LawSuit Case Type for Case ID: {CaseId}", request.CaseId);

                // Call AI Provider
                var aiProvider = _aiProviderFactory.GetProvider();
                var caseTypeModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.LawsuitCaseType);
                var systemPromptContent = await _promptCache.GetAsync(Path.Combine("المرحلة الثانية إعداد صحيفة الدعوى", "lawsuit-step1-case-type.txt"), cancellationToken);
                var aiResult = await aiProvider.SendChatCompletionAsync(
                    systemPromptContent,
                    finalPrompt,
                    AIRequestOptions.ForAnalysis with { Model = caseTypeModel },
                    cancellationToken);

                if (!aiResult.Succeeded || aiResult.Data == null || string.IsNullOrWhiteSpace(aiResult.Data.Content))
                    return Result<LawSuitCaseTypeResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في تصنيف نوع القضية");

                var rawResponse = aiResult.Data.Content;

                await _trackingService.RecordGeminiUsageAsync(
                    caseEntity.LawyerId,
                    request.CaseId,
                    AiStepType.LawsuitCaseType,
                    caseTypeModel ?? "gemini-3-flash-preview",
                    aiResult.Data.Usage,
                    CancellationToken.None);

                var parsedResponse = ParseLawSuitCaseTypeJson(rawResponse);
                if (parsedResponse == null)
                    return Result<LawSuitCaseTypeResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في تحليل استجابة تصنيف القضية");

                // Delete existing LawSuitCaseType for this case before adding new one
                var existingRecords = await _unitOfWork.Repository<Core.Models.LawSuitCaseType>()
                    .WhereAsync(x => x.CaseId == request.CaseId, cancellationToken);

                foreach (var existing in existingRecords)
                    _unitOfWork.Repository<Core.Models.LawSuitCaseType>().Delete(existing);

                // Save to database
                var lawSuitCaseType = new Core.Models.LawSuitCaseType
                {
                    CaseId = request.CaseId,
                    CaseMainType = parsedResponse.CaseMainType,
                    CaseSubType = parsedResponse.CaseSubType,
                    CourtType = parsedResponse.CourtType,
                    ProceduralNature = parsedResponse.ProceduralNature,
                    IsUrgentOrSummary = parsedResponse.IsUrgentOrSummary,
                    JustificationSummary = parsedResponse.JustificationSummary
                };

                await _unitOfWork.Repository<Core.Models.LawSuitCaseType>().AddAsync(lawSuitCaseType);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("LawSuit Case Type classification saved for Case ID: {CaseId}", request.CaseId);

                parsedResponse.CaseId = request.CaseId;
                return Result<LawSuitCaseTypeResponseDto>.Success(parsedResponse, "تم تصنيف نوع القضية بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error classifying LawSuit Case Type for Case {CaseId}", request.CaseId);
                return Result<LawSuitCaseTypeResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء تصنيف نوع القضية");
            }
        }

        public async Task<Result<LawSuitCaseTypeResponseDto>> GetLawSuitCaseTypeByCaseIdAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<LawSuitCaseTypeResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == caseId, cancellationToken);

                if (caseEntity == null)
                    return Result<LawSuitCaseTypeResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<LawSuitCaseTypeResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var lawSuitCaseType = await _unitOfWork.Repository<Core.Models.LawSuitCaseType>()
                    .FirstOrDefaultAsync(x => x.CaseId == caseId, cancellationToken);

                if (lawSuitCaseType == null)
                    return Result<LawSuitCaseTypeResponseDto>.Error(HttpStatusCode.NotFound, "لا يوجد تصنيف لهذه القضية");

                var result = new LawSuitCaseTypeResponseDto
                {
                    CaseId = caseId,
                    CaseMainType = lawSuitCaseType.CaseMainType,
                    CaseSubType = lawSuitCaseType.CaseSubType,
                    CourtType = lawSuitCaseType.CourtType,
                    ProceduralNature = lawSuitCaseType.ProceduralNature,
                    IsUrgentOrSummary = lawSuitCaseType.IsUrgentOrSummary,
                    JustificationSummary = lawSuitCaseType.JustificationSummary
                };

                return Result<LawSuitCaseTypeResponseDto>.Success(result, "تم جلب تصنيف القضية بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting LawSuit Case Type for Case {CaseId}", caseId);
                return Result<LawSuitCaseTypeResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب تصنيف القضية");
            }
        }

        private LawSuitCaseTypeResponseDto? ParseLawSuitCaseTypeJson(string jsonText)
        {
            try
            {
                return DeserializeSnakeOrCamelJson<LawSuitCaseTypeResponseDto>(jsonText);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse LawSuit Case Type JSON");
                return null;
            }
        }

        #region LawSuit Parties

        public async Task<Result<LawSuitPartiesResponseDto>> ExtractLawSuitPartiesAsync(
            LawSuitPartiesRequestDto request,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (request.CaseId == Guid.Empty)
                    return Result<LawSuitPartiesResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == request.CaseId, cancellationToken, x => x.CaseType);

                if (caseEntity == null)
                    return Result<LawSuitPartiesResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<LawSuitPartiesResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var promptTemplatePath = Path.Combine(_contentRootPath, "wwwroot", "prompts", "المرحلة الثانية إعداد صحيفة الدعوى", "lawsuit-step2-parties.txt");
                if (!File.Exists(promptTemplatePath))
                    return Result<LawSuitPartiesResponseDto>.Error(HttpStatusCode.InternalServerError, "Prompt file not found");

                var promptTemplate = await _promptCache.GetAsync(Path.GetRelativePath(Path.Combine(_contentRootPath, "wwwroot", "prompts"), promptTemplatePath), cancellationToken);

                var caseTypeName = await ResolveCaseTypeNameAsync(caseEntity.CaseTypeId, cancellationToken);
                var fullCaseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseTypeName);

                var finalPrompt = $"{promptTemplate}\n\n--- بيانات القضية الكاملة ---\n{fullCaseContext}";

                _logger.LogInformation("Extracting LawSuit Parties for Case ID: {CaseId}", request.CaseId);

                var aiProvider = _aiProviderFactory.GetProvider();
                var partiesModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.LawsuitParties);
                var systemPromptContent = await _promptCache.GetAsync(Path.Combine("المرحلة الثانية إعداد صحيفة الدعوى", "lawsuit-step2-parties.txt"), cancellationToken);
                var aiResult = await aiProvider.SendChatCompletionAsync(
                    systemPromptContent,
                    finalPrompt,
                    AIRequestOptions.ForAnalysis with { Model = partiesModel },
                    cancellationToken);

                if (!aiResult.Succeeded || aiResult.Data == null || string.IsNullOrWhiteSpace(aiResult.Data.Content))
                    return Result<LawSuitPartiesResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في استخراج بيانات الأطراف");

                await _trackingService.RecordGeminiUsageAsync(
                    caseEntity.LawyerId,
                    request.CaseId,
                    AiStepType.LawsuitParties,
                    partiesModel ?? "gemini-3-flash-preview",
                    aiResult.Data.Usage,
                    CancellationToken.None);

                var parsedResponse = ParseLawSuitPartiesJson(aiResult.Data.Content);
                if (parsedResponse == null)
                    return Result<LawSuitPartiesResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في تحليل استجابة بيانات الأطراف");

                // Delete existing parties for this case
                var existingRecords = await _unitOfWork.Repository<Core.Models.LawSuitParty>()
                    .WhereAsync(x => x.CaseId == request.CaseId, cancellationToken);

                foreach (var existing in existingRecords)
                    _unitOfWork.Repository<Core.Models.LawSuitParty>().Delete(existing);

                // Save new parties
                var partiesToSave = parsedResponse.Parties.Select(p => new Core.Models.LawSuitParty
                {
                    CaseId = request.CaseId,
                    Name = p.Name,
                    Role = p.Role,
                    Type = p.Type,
                    LegalCapacity = p.LegalCapacity,
                    Address = p.Address,
                    NationalId = p.NationalId
                }).ToList();

                foreach (var party in partiesToSave)
                    await _unitOfWork.Repository<Core.Models.LawSuitParty>().AddAsync(party);

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("LawSuit Parties saved for Case ID: {CaseId}", request.CaseId);

                // Update response with saved IDs
                parsedResponse.CaseId = request.CaseId;
                for (int i = 0; i < parsedResponse.Parties.Count && i < partiesToSave.Count; i++)
                {
                    parsedResponse.Parties[i].Id = partiesToSave[i].Id;
                }

                return Result<LawSuitPartiesResponseDto>.Success(parsedResponse, "تم استخراج بيانات الأطراف بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting LawSuit Parties for Case {CaseId}", request.CaseId);
                return Result<LawSuitPartiesResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء استخراج بيانات الأطراف");
            }
        }

        public async Task<Result<LawSuitPartiesResponseDto>> GetLawSuitPartiesByCaseIdAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<LawSuitPartiesResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == caseId, cancellationToken);

                if (caseEntity == null)
                    return Result<LawSuitPartiesResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<LawSuitPartiesResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var parties = await _unitOfWork.Repository<Core.Models.LawSuitParty>()
                    .WhereAsync(x => x.CaseId == caseId, cancellationToken);

                if (!parties.Any())
                    return Result<LawSuitPartiesResponseDto>.Error(HttpStatusCode.NotFound, "لا توجد بيانات أطراف لهذه القضية");

                var result = new LawSuitPartiesResponseDto
                {
                    CaseId = caseId,
                    Parties = parties.Select(p => new PartyDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Role = p.Role,
                        Type = p.Type,
                        LegalCapacity = p.LegalCapacity,
                        Address = p.Address,
                        NationalId = p.NationalId
                    }).ToList()
                };

                return Result<LawSuitPartiesResponseDto>.Success(result, "تم جلب بيانات الأطراف بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting LawSuit Parties for Case {CaseId}", caseId);
                return Result<LawSuitPartiesResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب بيانات الأطراف");
            }
        }

        private LawSuitPartiesResponseDto? ParseLawSuitPartiesJson(string jsonText)
        {
            try
            {
                return DeserializeSnakeOrCamelJson<LawSuitPartiesResponseDto>(jsonText);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse LawSuit Parties JSON");
                return null;
            }
        }

        #endregion

        #region LawSuit Subjects

        public async Task<Result<LawSuitSubjectsResponseDto>> GenerateLawSuitSubjectsAsync(
            LawSuitSubjectsRequestDto request,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (request.CaseId == Guid.Empty)
                    return Result<LawSuitSubjectsResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == request.CaseId, cancellationToken, x => x.CaseType);

                if (caseEntity == null)
                    return Result<LawSuitSubjectsResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<LawSuitSubjectsResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var promptTemplatePath = Path.Combine(_contentRootPath, "wwwroot", "prompts", "المرحلة الثانية إعداد صحيفة الدعوى", "lawsuit-step4-subject.txt");
                if (!File.Exists(promptTemplatePath))
                    return Result<LawSuitSubjectsResponseDto>.Error(HttpStatusCode.InternalServerError, "Prompt file not found");

                var promptTemplate = await _promptCache.GetAsync(Path.GetRelativePath(Path.Combine(_contentRootPath, "wwwroot", "prompts"), promptTemplatePath), cancellationToken);

                var caseTypeName = await ResolveCaseTypeNameAsync(caseEntity.CaseTypeId, cancellationToken);
                var fullCaseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseTypeName);

                var finalPrompt = $"{promptTemplate}\n\n--- بيانات القضية الكاملة ---\n{fullCaseContext}";

                _logger.LogInformation("Generating LawSuit Subjects for Case ID: {CaseId}", request.CaseId);

                var aiProvider = _aiProviderFactory.GetProvider();
                var subjectsModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.LawsuitSubjects);
                var systemPromptContent = await _promptCache.GetAsync(Path.Combine("المرحلة الثانية إعداد صحيفة الدعوى", "lawsuit-step4-subject.txt"), cancellationToken);
                var aiResult = await aiProvider.SendChatCompletionAsync(
                    systemPromptContent,
                    finalPrompt,
                    AIRequestOptions.ForAnalysis with { Model = subjectsModel },
                    cancellationToken);

                if (!aiResult.Succeeded || aiResult.Data == null || string.IsNullOrWhiteSpace(aiResult.Data.Content))
                    return Result<LawSuitSubjectsResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في تحديد موضوع الدعوى");

                await _trackingService.RecordGeminiUsageAsync(
                    caseEntity.LawyerId,
                    request.CaseId,
                    AiStepType.LawsuitSubjects,
                    subjectsModel ?? "gemini-3-flash-preview",
                    aiResult.Data.Usage,
                    CancellationToken.None);

                var parsedResponse = ParseLawSuitSubjectsJson(aiResult.Data.Content);
                if (parsedResponse == null)
                    return Result<LawSuitSubjectsResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في تحليل استجابة موضوع الدعوى");

                // Delete existing subjects for this case
                var existingRecords = await _unitOfWork.Repository<Core.Models.LawSuitSubject>()
                    .WhereAsync(x => x.CaseId == request.CaseId, cancellationToken);

                foreach (var existing in existingRecords)
                    _unitOfWork.Repository<Core.Models.LawSuitSubject>().Delete(existing);

                // Save new subject
                var lawSuitSubject = new Core.Models.LawSuitSubject
                {
                    CaseId = request.CaseId,
                    SubjectTitle = parsedResponse.SubjectTitle,
                    SubjectFullText = parsedResponse.SubjectFullText
                };

                await _unitOfWork.Repository<Core.Models.LawSuitSubject>().AddAsync(lawSuitSubject);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("LawSuit Subjects saved for Case ID: {CaseId}", request.CaseId);

                parsedResponse.CaseId = request.CaseId;
                return Result<LawSuitSubjectsResponseDto>.Success(parsedResponse, "تم تحديد موضوع الدعوى بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating LawSuit Subjects for Case {CaseId}", request.CaseId);
                return Result<LawSuitSubjectsResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء تحديد موضوع الدعوى");
            }
        }

        public async Task<Result<LawSuitSubjectsResponseDto>> GetLawSuitSubjectsByCaseIdAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<LawSuitSubjectsResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == caseId, cancellationToken);

                if (caseEntity == null)
                    return Result<LawSuitSubjectsResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<LawSuitSubjectsResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var lawSuitSubject = await _unitOfWork.Repository<Core.Models.LawSuitSubject>()
                    .FirstOrDefaultAsync(x => x.CaseId == caseId, cancellationToken);

                if (lawSuitSubject == null)
                    return Result<LawSuitSubjectsResponseDto>.Error(HttpStatusCode.NotFound, "لا يوجد موضوع لهذه القضية");

                var result = new LawSuitSubjectsResponseDto
                {
                    CaseId = caseId,
                    SubjectTitle = lawSuitSubject.SubjectTitle,
                    SubjectFullText = lawSuitSubject.SubjectFullText
                };

                return Result<LawSuitSubjectsResponseDto>.Success(result, "تم جلب موضوع الدعوى بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting LawSuit Subjects for Case {CaseId}", caseId);
                return Result<LawSuitSubjectsResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب موضوع الدعوى");
            }
        }

        private LawSuitSubjectsResponseDto? ParseLawSuitSubjectsJson(string jsonText)
        {
            try
            {
                return DeserializeSnakeOrCamelJson<LawSuitSubjectsResponseDto>(jsonText);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse LawSuit Subjects JSON");
                return null;
            }
        }

        #endregion

        #region LawSuit Facts

        public async Task<Result<LawSuitFactsResponseDto>> GenerateLawSuitFactsAsync(
            LawSuitFactsRequestDto request,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (request.CaseId == Guid.Empty)
                    return Result<LawSuitFactsResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == request.CaseId, cancellationToken, x => x.CaseType);

                if (caseEntity == null)
                    return Result<LawSuitFactsResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<LawSuitFactsResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var promptTemplatePath = Path.Combine(_contentRootPath, "wwwroot", "prompts", "المرحلة الثانية إعداد صحيفة الدعوى", "lawsuit-step3-facts.txt");
                if (!File.Exists(promptTemplatePath))
                    return Result<LawSuitFactsResponseDto>.Error(HttpStatusCode.InternalServerError, "Prompt file not found");

                var promptTemplate = await _promptCache.GetAsync(Path.GetRelativePath(Path.Combine(_contentRootPath, "wwwroot", "prompts"), promptTemplatePath), cancellationToken);

                var caseTypeName = await ResolveCaseTypeNameAsync(caseEntity.CaseTypeId, cancellationToken);
                var fullCaseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseTypeName);

                var finalPrompt = $"{promptTemplate}\n\n--- بيانات القضية الكاملة ---\n{fullCaseContext}";

                _logger.LogInformation("Generating LawSuit Facts for Case ID: {CaseId}", request.CaseId);

                var aiProvider = _aiProviderFactory.GetProvider();
                var factsModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.LawsuitFacts);
                var systemPromptContent = await _promptCache.GetAsync(Path.Combine("المرحلة الثانية إعداد صحيفة الدعوى", "lawsuit-step3-facts.txt"), cancellationToken);
                var aiResult = await aiProvider.SendChatCompletionAsync(
                    systemPromptContent,
                    finalPrompt,
                    AIRequestOptions.ForAnalysis with { Model = factsModel },
                    cancellationToken);

                if (!aiResult.Succeeded || aiResult.Data == null || string.IsNullOrWhiteSpace(aiResult.Data.Content))
                    return Result<LawSuitFactsResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في صياغة وقائع الدعوى");

                await _trackingService.RecordGeminiUsageAsync(
                    caseEntity.LawyerId,
                    request.CaseId,
                    AiStepType.LawsuitFacts,
                    factsModel ?? "gemini-3-flash-preview",
                    aiResult.Data.Usage,
                    CancellationToken.None);

                var parsedResponse = ParseLawSuitFactsJson(aiResult.Data.Content);
                if (parsedResponse == null)
                    return Result<LawSuitFactsResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في تحليل استجابة وقائع الدعوى");

                // Delete existing facts for this case
                var existingRecords = await _unitOfWork.Repository<Core.Models.LawSuitFacts>()
                    .WhereAsync(x => x.CaseId == request.CaseId, cancellationToken);

                foreach (var existing in existingRecords)
                    _unitOfWork.Repository<Core.Models.LawSuitFacts>().Delete(existing);

                // Save new facts
                var lawSuitFacts = new Core.Models.LawSuitFacts
                {
                    CaseId = request.CaseId,
                    FactsNarrative = parsedResponse.FactsNarrative
                };

                await _unitOfWork.Repository<Core.Models.LawSuitFacts>().AddAsync(lawSuitFacts);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("LawSuit Facts saved for Case ID: {CaseId}", request.CaseId);

                parsedResponse.CaseId = request.CaseId;
                return Result<LawSuitFactsResponseDto>.Success(parsedResponse, "تم صياغة وقائع الدعوى بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating LawSuit Facts for Case {CaseId}", request.CaseId);
                return Result<LawSuitFactsResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء صياغة وقائع الدعوى");
            }
        }

        public async Task<Result<LawSuitFactsResponseDto>> GetLawSuitFactsByCaseIdAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<LawSuitFactsResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == caseId, cancellationToken);

                if (caseEntity == null)
                    return Result<LawSuitFactsResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<LawSuitFactsResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var lawSuitFacts = await _unitOfWork.Repository<Core.Models.LawSuitFacts>()
                    .FirstOrDefaultAsync(x => x.CaseId == caseId, cancellationToken);

                if (lawSuitFacts == null)
                    return Result<LawSuitFactsResponseDto>.Error(HttpStatusCode.NotFound, "لا توجد وقائع لهذه القضية");

                var result = new LawSuitFactsResponseDto
                {
                    CaseId = caseId,
                    FactsNarrative = lawSuitFacts.FactsNarrative
                };

                return Result<LawSuitFactsResponseDto>.Success(result, "تم جلب وقائع الدعوى بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting LawSuit Facts for Case {CaseId}", caseId);
                return Result<LawSuitFactsResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب وقائع الدعوى");
            }
        }

        private LawSuitFactsResponseDto? ParseLawSuitFactsJson(string jsonText)
        {
            try
            {
                return DeserializeSnakeOrCamelJson<LawSuitFactsResponseDto>(jsonText);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse LawSuit Facts JSON");
                return null;
            }
        }

        #endregion

        #region LawSuit Legal Basis

        public async Task<Result<LawSuitLegalBasisResponseDto>> GenerateLawSuitLegalBasisAsync(
            LawSuitLegalBasisRequestDto request,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (request.CaseId == Guid.Empty)
                    return Result<LawSuitLegalBasisResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == request.CaseId, cancellationToken, x => x.CaseType);

                if (caseEntity == null)
                    return Result<LawSuitLegalBasisResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<LawSuitLegalBasisResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var promptTemplatePath = Path.Combine(_contentRootPath, "wwwroot", "prompts", "المرحلة الثانية إعداد صحيفة الدعوى", "lawsuit-step5-legal-basis.txt");
                if (!File.Exists(promptTemplatePath))
                    return Result<LawSuitLegalBasisResponseDto>.Error(HttpStatusCode.InternalServerError, "Prompt file not found");

                var promptTemplate = await _promptCache.GetAsync(Path.GetRelativePath(Path.Combine(_contentRootPath, "wwwroot", "prompts"), promptTemplatePath), cancellationToken);

                var caseTypeName = await ResolveCaseTypeNameAsync(caseEntity.CaseTypeId, cancellationToken);
                var fullCaseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseTypeName);

                var finalPrompt = $"{promptTemplate}\n\n--- بيانات القضية الكاملة ---\n{fullCaseContext}";

                _logger.LogInformation("Generating LawSuit Legal Basis for Case ID: {CaseId}", request.CaseId);

                var aiProvider = _aiProviderFactory.GetProvider();
                var legalBasisModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.LawsuitLegalBasis);
                var systemPromptContent = await _promptCache.GetAsync(Path.Combine("المرحلة الثانية إعداد صحيفة الدعوى", "lawsuit-step5-legal-basis.txt"), cancellationToken);
                var aiResult = await aiProvider.SendChatCompletionAsync(
                    systemPromptContent,
                    finalPrompt,
                    AIRequestOptions.ForAnalysis with { Model = legalBasisModel },
                    cancellationToken);

                if (!aiResult.Succeeded || aiResult.Data == null || string.IsNullOrWhiteSpace(aiResult.Data.Content))
                    return Result<LawSuitLegalBasisResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في تأسيس السند القانوني");

                await _trackingService.RecordGeminiUsageAsync(
                    caseEntity.LawyerId,
                    request.CaseId,
                    AiStepType.LawsuitLegalBasis,
                    legalBasisModel ?? "gemini-3-flash-preview",
                    aiResult.Data.Usage,
                    CancellationToken.None);

                var parsedResponse = ParseLawSuitLegalBasisJson(aiResult.Data.Content);
                if (parsedResponse == null)
                    return Result<LawSuitLegalBasisResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في تحليل استجابة السند القانوني");

                // Delete existing legal texts for this case
                var existingTexts = await _unitOfWork.Repository<Core.Models.LawSuitLegalText>()
                    .WhereAsync(x => x.CaseId == request.CaseId, cancellationToken);

                foreach (var existing in existingTexts)
                    _unitOfWork.Repository<Core.Models.LawSuitLegalText>().Delete(existing);

                // Delete existing cassation rulings for this case
                var existingRulings = await _unitOfWork.Repository<Core.Models.LawSuitCassationRuling>()
                    .WhereAsync(x => x.CaseId == request.CaseId, cancellationToken);

                foreach (var existing in existingRulings)
                    _unitOfWork.Repository<Core.Models.LawSuitCassationRuling>().Delete(existing);

                // Save new legal texts
                var legalTextsToSave = parsedResponse.LegalTexts.Select(t => new Core.Models.LawSuitLegalText
                {
                    CaseId = request.CaseId,
                    LawName = t.LawName,
                    ArticleNumber = t.ArticleNumber,
                    ArticleText = t.ArticleText,
                    ApplicationNotes = t.ApplicationNotes
                }).ToList();

                foreach (var text in legalTextsToSave)
                    await _unitOfWork.Repository<Core.Models.LawSuitLegalText>().AddAsync(text);

                // Save new cassation rulings
                var rulingsToSave = parsedResponse.CassationRulings.Select(r => new Core.Models.LawSuitCassationRuling
                {
                    CaseId = request.CaseId,
                    Court = r.Court,
                    AppealNumber = r.AppealNumber,
                    JudicialYear = r.JudicialYear,
                    SessionDate = r.SessionDate,
                    RulingText = r.RulingText,
                    ApplicationNotes = r.ApplicationNotes
                }).ToList();

                foreach (var ruling in rulingsToSave)
                    await _unitOfWork.Repository<Core.Models.LawSuitCassationRuling>().AddAsync(ruling);

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("LawSuit Legal Basis saved for Case ID: {CaseId}", request.CaseId);

                // Update response with saved IDs
                parsedResponse.CaseId = request.CaseId;
                for (int i = 0; i < parsedResponse.LegalTexts.Count && i < legalTextsToSave.Count; i++)
                {
                    parsedResponse.LegalTexts[i].Id = legalTextsToSave[i].Id;
                }
                for (int i = 0; i < parsedResponse.CassationRulings.Count && i < rulingsToSave.Count; i++)
                {
                    parsedResponse.CassationRulings[i].Id = rulingsToSave[i].Id;
                }

                return Result<LawSuitLegalBasisResponseDto>.Success(parsedResponse, "تم تأسيس السند القانوني بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating LawSuit Legal Basis for Case {CaseId}", request.CaseId);
                return Result<LawSuitLegalBasisResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء تأسيس السند القانوني");
            }
        }

        public async Task<Result<LawSuitLegalBasisResponseDto>> GetLawSuitLegalBasisByCaseIdAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<LawSuitLegalBasisResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == caseId, cancellationToken);

                if (caseEntity == null)
                    return Result<LawSuitLegalBasisResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<LawSuitLegalBasisResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var legalTexts = await _unitOfWork.Repository<Core.Models.LawSuitLegalText>()
                    .WhereAsync(x => x.CaseId == caseId, cancellationToken);

                var cassationRulings = await _unitOfWork.Repository<Core.Models.LawSuitCassationRuling>()
                    .WhereAsync(x => x.CaseId == caseId, cancellationToken);

                if (!legalTexts.Any() && !cassationRulings.Any())
                    return Result<LawSuitLegalBasisResponseDto>.Error(HttpStatusCode.NotFound, "لا يوجد سند قانوني لهذه القضية");

                var result = new LawSuitLegalBasisResponseDto
                {
                    CaseId = caseId,
                    LegalTexts = legalTexts.Select(t => new LegalTextDto
                    {
                        Id = t.Id,
                        LawName = t.LawName,
                        ArticleNumber = t.ArticleNumber,
                        ArticleText = t.ArticleText,
                        ApplicationNotes = t.ApplicationNotes
                    }).ToList(),
                    CassationRulings = cassationRulings.Select(r => new CassationRulingDto
                    {
                        Id = r.Id,
                        Court = r.Court,
                        AppealNumber = r.AppealNumber,
                        JudicialYear = r.JudicialYear,
                        SessionDate = r.SessionDate,
                        RulingText = r.RulingText,
                        ApplicationNotes = r.ApplicationNotes
                    }).ToList()
                };

                return Result<LawSuitLegalBasisResponseDto>.Success(result, "تم جلب السند القانوني بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting LawSuit Legal Basis for Case {CaseId}", caseId);
                return Result<LawSuitLegalBasisResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب السند القانوني");
            }
        }

        private LawSuitLegalBasisResponseDto? ParseLawSuitLegalBasisJson(string jsonText)
        {
            try
            {
                return DeserializeSnakeOrCamelJson<LawSuitLegalBasisResponseDto>(jsonText);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse LawSuit Legal Basis JSON");
                return null;
            }
        }

        #endregion

        #region LawSuit Requests

        public async Task<Result<LawSuitRequestsResponseDto>> GenerateLawSuitRequestsAsync(
            LawSuitRequestsRequestDto request,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (request.CaseId == Guid.Empty)
                    return Result<LawSuitRequestsResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == request.CaseId, cancellationToken, x => x.CaseType);

                if (caseEntity == null)
                    return Result<LawSuitRequestsResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<LawSuitRequestsResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var promptTemplatePath = Path.Combine(_contentRootPath, "wwwroot", "prompts", "المرحلة الثانية إعداد صحيفة الدعوى", "lawsuit-step6-requests.txt");
                if (!File.Exists(promptTemplatePath))
                    return Result<LawSuitRequestsResponseDto>.Error(HttpStatusCode.InternalServerError, "Prompt file not found");

                var promptTemplate = await _promptCache.GetAsync(Path.GetRelativePath(Path.Combine(_contentRootPath, "wwwroot", "prompts"), promptTemplatePath), cancellationToken);

                var caseTypeName = await ResolveCaseTypeNameAsync(caseEntity.CaseTypeId, cancellationToken);
                var fullCaseContext = AnalysisHelpers.BuildCaseContext(caseEntity, caseTypeName);

                var finalPrompt = $"{promptTemplate}\n\n--- بيانات القضية الكاملة ---\n{fullCaseContext}";

                _logger.LogInformation("Generating LawSuit Requests for Case ID: {CaseId}", request.CaseId);

                var aiProvider = _aiProviderFactory.GetProvider();
                var requestsModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.LawsuitRequests);
                var systemPromptContent = await _promptCache.GetAsync(Path.Combine("المرحلة الثانية إعداد صحيفة الدعوى", "lawsuit-step6-requests.txt"), cancellationToken);
                var aiResult = await aiProvider.SendChatCompletionAsync(
                    systemPromptContent,
                    finalPrompt,
                    AIRequestOptions.ForAnalysis with { Model = requestsModel },
                    cancellationToken);

                if (!aiResult.Succeeded || aiResult.Data == null || string.IsNullOrWhiteSpace(aiResult.Data.Content))
                    return Result<LawSuitRequestsResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في صياغة الطلبات");

                await _trackingService.RecordGeminiUsageAsync(
                    caseEntity.LawyerId,
                    request.CaseId,
                    AiStepType.LawsuitRequests,
                    requestsModel ?? "gemini-3-flash-preview",
                    aiResult.Data.Usage,
                    CancellationToken.None);

                var parsedResponse = ParseLawSuitRequestsJson(aiResult.Data.Content);
                if (parsedResponse == null)
                    return Result<LawSuitRequestsResponseDto>.Error(HttpStatusCode.InternalServerError, "فشل في تحليل استجابة الطلبات");

                // Delete existing requests for this case
                var existingRequests = await _unitOfWork.Repository<Core.Models.LawSuitRequest>()
                    .WhereAsync(x => x.CaseId == request.CaseId, cancellationToken);

                foreach (var existing in existingRequests)
                    _unitOfWork.Repository<Core.Models.LawSuitRequest>().Delete(existing);

                // Save new requests
                var requestsToSave = new List<Core.Models.LawSuitRequest>();

                foreach (var r in parsedResponse.PrincipalRequests)
                {
                    requestsToSave.Add(new Core.Models.LawSuitRequest
                    {
                        CaseId = request.CaseId,
                        RequestType = Core.Models.LawSuitRequestType.Principal,
                        RequestNumber = r.RequestNumber,
                        RequestText = r.RequestText,
                        LegalReference = r.LegalReference
                    });
                }

                foreach (var r in parsedResponse.SubsidiaryRequests)
                {
                    requestsToSave.Add(new Core.Models.LawSuitRequest
                    {
                        CaseId = request.CaseId,
                        RequestType = Core.Models.LawSuitRequestType.Subsidiary,
                        RequestNumber = r.RequestNumber,
                        RequestText = r.RequestText,
                        LegalReference = r.LegalReference
                    });
                }

                foreach (var r in parsedResponse.ProceduralRequests)
                {
                    requestsToSave.Add(new Core.Models.LawSuitRequest
                    {
                        CaseId = request.CaseId,
                        RequestType = Core.Models.LawSuitRequestType.Procedural,
                        RequestNumber = r.RequestNumber,
                        RequestText = r.RequestText,
                        LegalReference = r.LegalReference
                    });
                }

                foreach (var req in requestsToSave)
                    await _unitOfWork.Repository<Core.Models.LawSuitRequest>().AddAsync(req);

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("LawSuit Requests saved for Case ID: {CaseId}", request.CaseId);

                // Update response with saved IDs
                parsedResponse.CaseId = request.CaseId;
                var principalSaved = requestsToSave.Where(r => r.RequestType == Core.Models.LawSuitRequestType.Principal).ToList();
                var subsidiarySaved = requestsToSave.Where(r => r.RequestType == Core.Models.LawSuitRequestType.Subsidiary).ToList();
                var proceduralSaved = requestsToSave.Where(r => r.RequestType == Core.Models.LawSuitRequestType.Procedural).ToList();

                for (int i = 0; i < parsedResponse.PrincipalRequests.Count && i < principalSaved.Count; i++)
                    parsedResponse.PrincipalRequests[i].Id = principalSaved[i].Id;
                for (int i = 0; i < parsedResponse.SubsidiaryRequests.Count && i < subsidiarySaved.Count; i++)
                    parsedResponse.SubsidiaryRequests[i].Id = subsidiarySaved[i].Id;
                for (int i = 0; i < parsedResponse.ProceduralRequests.Count && i < proceduralSaved.Count; i++)
                    parsedResponse.ProceduralRequests[i].Id = proceduralSaved[i].Id;

                return Result<LawSuitRequestsResponseDto>.Success(parsedResponse, "تم صياغة الطلبات بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating LawSuit Requests for Case {CaseId}", request.CaseId);
                return Result<LawSuitRequestsResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء صياغة الطلبات");
            }
        }

        public async Task<Result<LawSuitRequestsResponseDto>> GetLawSuitRequestsByCaseIdAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<LawSuitRequestsResponseDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == caseId, cancellationToken);

                if (caseEntity == null)
                    return Result<LawSuitRequestsResponseDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<LawSuitRequestsResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var requests = await _unitOfWork.Repository<Core.Models.LawSuitRequest>()
                    .WhereAsync(x => x.CaseId == caseId, cancellationToken);

                if (!requests.Any())
                    return Result<LawSuitRequestsResponseDto>.Error(HttpStatusCode.NotFound, "لا توجد طلبات لهذه القضية");

                var result = new LawSuitRequestsResponseDto
                {
                    CaseId = caseId,
                    PrincipalRequests = requests
                        .Where(r => r.RequestType == Core.Models.LawSuitRequestType.Principal)
                        .Select(r => new LawSuitRequestItemDto
                        {
                            Id = r.Id,
                            RequestNumber = r.RequestNumber,
                            RequestText = r.RequestText,
                            LegalReference = r.LegalReference
                        }).ToList(),
                    SubsidiaryRequests = requests
                        .Where(r => r.RequestType == Core.Models.LawSuitRequestType.Subsidiary)
                        .Select(r => new LawSuitRequestItemDto
                        {
                            Id = r.Id,
                            RequestNumber = r.RequestNumber,
                            RequestText = r.RequestText,
                            LegalReference = r.LegalReference
                        }).ToList(),
                    ProceduralRequests = requests
                        .Where(r => r.RequestType == Core.Models.LawSuitRequestType.Procedural)
                        .Select(r => new LawSuitRequestItemDto
                        {
                            Id = r.Id,
                            RequestNumber = r.RequestNumber,
                            RequestText = r.RequestText,
                            LegalReference = r.LegalReference
                        }).ToList()
                };

                return Result<LawSuitRequestsResponseDto>.Success(result, "تم جلب الطلبات بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting LawSuit Requests for Case {CaseId}", caseId);
                return Result<LawSuitRequestsResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب الطلبات");
            }
        }

        private LawSuitRequestsResponseDto? ParseLawSuitRequestsJson(string jsonText)
        {
            try
            {
                return DeserializeSnakeOrCamelJson<LawSuitRequestsResponseDto>(jsonText);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse LawSuit Requests JSON");
                return null;
            }
        }

        #endregion

        #region Helper Methods



        public async Task<Result<Dtos.Workflows.WorkflowStartNewResponseDto>> StartNewCleanAsync(Guid caseId, string lawyerId, CancellationToken ct)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                    return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var caseTypes = await _unitOfWork.Repository<Core.Models.LawSuitCaseType>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var ct2 in caseTypes) _unitOfWork.Repository<Core.Models.LawSuitCaseType>().Delete(ct2);

                var parties = await _unitOfWork.Repository<Core.Models.LawSuitParty>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var p in parties) _unitOfWork.Repository<Core.Models.LawSuitParty>().Delete(p);

                var subjects = await _unitOfWork.Repository<Core.Models.LawSuitSubject>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var s in subjects) _unitOfWork.Repository<Core.Models.LawSuitSubject>().Delete(s);

                var facts = await _unitOfWork.Repository<Core.Models.LawSuitFacts>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var f in facts) _unitOfWork.Repository<Core.Models.LawSuitFacts>().Delete(f);

                var legalTexts = await _unitOfWork.Repository<Core.Models.LawSuitLegalText>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var lt in legalTexts) _unitOfWork.Repository<Core.Models.LawSuitLegalText>().Delete(lt);

                var cassationRulings = await _unitOfWork.Repository<Core.Models.LawSuitCassationRuling>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var cr in cassationRulings) _unitOfWork.Repository<Core.Models.LawSuitCassationRuling>().Delete(cr);

                var requests = await _unitOfWork.Repository<Core.Models.LawSuitRequest>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var r in requests) _unitOfWork.Repository<Core.Models.LawSuitRequest>().Delete(r);

                var aiStepTypes = new[] {
                    Core.Enum.AiStepType.LawsuitCaseType,
                    Core.Enum.AiStepType.LawsuitParties,
                    Core.Enum.AiStepType.LawsuitSubjects,
                    Core.Enum.AiStepType.LawsuitFacts,
                    Core.Enum.AiStepType.LawsuitLegalBasis,
                    Core.Enum.AiStepType.LawsuitRequests,
                    Core.Enum.AiStepType.StatementOfClaimsDraft
                };
                var aiJobs = await _unitOfWork.Repository<Core.Models.AiJob>().WhereAsync(x => x.CaseId == caseId && aiStepTypes.Contains(x.StepType), ct);
                foreach (var job in aiJobs) _unitOfWork.Repository<Core.Models.AiJob>().Delete(job);

                await _unitOfWork.SaveChangesAsync(ct);

                var now = DateTime.UtcNow;
                var dto = new Dtos.Workflows.WorkflowStartNewResponseDto(
                    0,
                    caseId.ToString(),
                    caseId,
                    "preparing-statement-of-claims",
                    "InProgress",
                    0,
                    0,
                    false,
                    now,
                    now,
                    false,
                    false,
                    true,
                    now
                );

                _logger.LogInformation("StartNewClean completed for Case {CaseId}", caseId);

                return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Success(dto, "تم تنظيف بيانات صحيفة الدعوى بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in StartNewClean for Case {CaseId}", caseId);
                return Result<Dtos.Workflows.WorkflowStartNewResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء تنظيف بيانات صحيفة الدعوى");
            }
        }

        public async Task<Result<bool>> AbandonWorkflowAsync(Guid caseId, string lawyerId, CancellationToken ct)
        {
            try
            {
                var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                    return Result<bool>.Error(accessResult.StatusCode, accessResult.Message);

                var caseTypes = await _unitOfWork.Repository<Core.Models.LawSuitCaseType>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var caseType in caseTypes) _unitOfWork.Repository<Core.Models.LawSuitCaseType>().Delete(caseType);

                var parties = await _unitOfWork.Repository<Core.Models.LawSuitParty>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var p in parties) _unitOfWork.Repository<Core.Models.LawSuitParty>().Delete(p);

                var subjects = await _unitOfWork.Repository<Core.Models.LawSuitSubject>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var s in subjects) _unitOfWork.Repository<Core.Models.LawSuitSubject>().Delete(s);

                var facts = await _unitOfWork.Repository<Core.Models.LawSuitFacts>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var f in facts) _unitOfWork.Repository<Core.Models.LawSuitFacts>().Delete(f);

                var legalTexts = await _unitOfWork.Repository<Core.Models.LawSuitLegalText>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var lt in legalTexts) _unitOfWork.Repository<Core.Models.LawSuitLegalText>().Delete(lt);

                var cassationRulings = await _unitOfWork.Repository<Core.Models.LawSuitCassationRuling>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var cr in cassationRulings) _unitOfWork.Repository<Core.Models.LawSuitCassationRuling>().Delete(cr);

                var requests = await _unitOfWork.Repository<Core.Models.LawSuitRequest>().WhereAsync(x => x.CaseId == caseId, ct);
                foreach (var r in requests) _unitOfWork.Repository<Core.Models.LawSuitRequest>().Delete(r);

                var aiStepTypes = new[] { 
                    Core.Enum.AiStepType.LawsuitCaseType,
                    Core.Enum.AiStepType.LawsuitParties,
                    Core.Enum.AiStepType.LawsuitSubjects,
                    Core.Enum.AiStepType.LawsuitFacts,
                    Core.Enum.AiStepType.LawsuitLegalBasis,
                    Core.Enum.AiStepType.LawsuitRequests,
                    Core.Enum.AiStepType.StatementOfClaimsDraft
                };
                var aiJobs = await _unitOfWork.Repository<Core.Models.AiJob>().WhereAsync(x => x.CaseId == caseId && aiStepTypes.Contains(x.StepType), ct);
                foreach (var job in aiJobs) _unitOfWork.Repository<Core.Models.AiJob>().Delete(job);

                await _unitOfWork.SaveChangesAsync(ct);

                return Result<bool>.Success(true, "تم إلغاء إجراءات التحضير بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error abandoning preparing statement of claims for Case {CaseId}", caseId);
                return Result<bool>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء إلغاء الإجراء");
            }
        }

        public async Task<Result<object>> SaveDraftAsync(Guid caseId, int stepNumber, Lawyer.Application.Dtos.Workflows.SaveWorkflowDraftRequest request, string lawyerId, CancellationToken ct)
        {
            try
            {
                var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                    return Result<object>.Error(accessResult.StatusCode, accessResult.Message);

                var now = DateTime.UtcNow;

                if (stepNumber != 7)
                {
                    _logger.LogInformation("PrepStatements auto-save acknowledged for Case {CaseId}, Step {Step}", caseId, stepNumber);
                    return Result<object>.Success(new { stepNumber, saved = true, lastSavedAt = now.ToString("O") });
                }

                var payloadEl = request.Payload is JsonElement e ? e : default(JsonElement?);
                string draftHtml;

                if (payloadEl is JsonElement je)
                {
                    if (je.ValueKind == JsonValueKind.Object)
                    {
                        draftHtml = je.TryGetProperty("draftHtml", out var htmlProp) && htmlProp.ValueKind == JsonValueKind.String
                            ? htmlProp.GetString() ?? string.Empty
                            : string.Empty;
                    }
                    else if (je.ValueKind == JsonValueKind.String)
                    {
                        draftHtml = je.GetString() ?? string.Empty;
                    }
                    else
                    {
                        draftHtml = je.GetRawText();
                    }
                }
                else
                {
                    draftHtml = request.Payload is string s ? s : JsonSerializer.Serialize(request.Payload);
                }

                var payloadJson = JsonSerializer.Serialize(new { draftHtml }, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var draftJob = await _unitOfWork.Repository<Core.Models.AiJob>()
                    .FirstOrDefaultAsync(x => x.CaseId == caseId && x.StepType == Core.Enum.AiStepType.StatementOfClaimsDraft, ct);

                if (draftJob == null)
                {
                    draftJob = new Core.Models.AiJob
                    {
                        CaseId = caseId,
                        StepType = Core.Enum.AiStepType.StatementOfClaimsDraft,
                        ResultJson = payloadJson,
                        Status = Core.Enum.AiJobStatus.Completed,
                        CreatedAt = now,
                        StartedAt = now,
                        CompletedAt = now
                    };

                    await _unitOfWork.Repository<Core.Models.AiJob>().AddAsync(draftJob);
                }
                else if (draftJob.Status != Core.Enum.AiJobStatus.Queued && draftJob.Status != Core.Enum.AiJobStatus.Processing)
                {
                    draftJob.ResultJson = payloadJson;
                    draftJob.CompletedAt = now;
                    await _unitOfWork.Repository<Core.Models.AiJob>().Update(draftJob);
                }

                await _unitOfWork.SaveChangesAsync(ct);

                return Result<object>.Success(new { stepNumber, saved = true, lastSavedAt = now.ToString("O") });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving draft for Case ID: {CaseId}, Step: {StepNumber}", caseId, stepNumber);
                return Result<object>.Error(HttpStatusCode.BadRequest, "حدث خطأ أثناء حفظ المسودة");
            }
        }

        #endregion

        #region Advance Stage

        public async Task<Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>> AdvanceStageAsync(
            Guid caseId, int fromStep, int toStep, string lawyerId, CancellationToken ct)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                    return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(accessResult.StatusCode, accessResult.Message);

                if (toStep != fromStep + 1)
                    return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.BadRequest, "يمكن الانتقال خطوة واحدة فقط");

                return await GetSummaryByCaseIdAsync(caseId, lawyerId, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error advancing stage for PrepStatements Case {CaseId}", caseId);
                return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء الانتقال إلى المرحلة التالية");
            }
        }

        #endregion

        #region Summary & Initialize

        public async Task<Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>> ResumeCurrentRunAsync(Guid caseId, string lawyerId, CancellationToken ct)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                {
                    if (accessResult.Message == "القضية غير موجودة")
                        return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.NotFound, accessResult.Message);
                    return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.Forbidden, accessResult.Message);
                }

                return await GetSummaryByCaseIdAsync(caseId, lawyerId, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resuming PrepStatements for Case {CaseId}", caseId);
                return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء استئناف إعداد صحيفة الدعوى");
            }
        }

        public async Task<Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>> GetSummaryByCaseIdAsync(
            Guid caseId, string lawyerId, CancellationToken ct)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == caseId, ct);
                if (caseEntity == null)
                    return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                    return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(accessResult.StatusCode, accessResult.Message);

                var summary = new Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto
                {
                    CaseId = caseId,
                    RunId = caseId.ToString()
                };

                int highestStep = 0;

                // Step 1 — LawSuitCaseType
                var caseType = await _unitOfWork.Repository<Core.Models.LawSuitCaseType>()
                    .FirstOrDefaultAsync(x => x.CaseId == caseId, ct);
                if (caseType != null)
                {
                    summary.Step1Output = new LawSuitCaseTypeResponseDto
                    {
                        CaseId = caseId,
                        CaseMainType = caseType.CaseMainType,
                        CaseSubType = caseType.CaseSubType,
                        CourtType = caseType.CourtType,
                        ProceduralNature = caseType.ProceduralNature,
                        IsUrgentOrSummary = caseType.IsUrgentOrSummary,
                        JustificationSummary = caseType.JustificationSummary
                    };
                    highestStep = 1;
                }

                // Step 2 — LawSuitParties
                var parties = await _unitOfWork.Repository<Core.Models.LawSuitParty>()
                    .WhereAsync(x => x.CaseId == caseId, ct);
                if (parties.Any())
                {
                    summary.Step2Output = new LawSuitPartiesResponseDto
                    {
                        CaseId = caseId,
                        Parties = parties.Select(p => new PartyDto
                        {
                            Id = p.Id,
                            Name = p.Name,
                            Role = p.Role,
                            Type = p.Type,
                            LegalCapacity = p.LegalCapacity,
                            Address = p.Address,
                            NationalId = p.NationalId
                        }).ToList()
                    };
                    highestStep = 2;
                }

                // Step 3 — LawSuitSubjects
                var subject = await _unitOfWork.Repository<Core.Models.LawSuitSubject>()
                    .FirstOrDefaultAsync(x => x.CaseId == caseId, ct);
                if (subject != null)
                {
                    summary.Step3Output = new LawSuitSubjectsResponseDto
                    {
                        CaseId = caseId,
                        SubjectTitle = subject.SubjectTitle,
                        SubjectFullText = subject.SubjectFullText
                    };
                    highestStep = 3;
                }

                // Step 4 — LawSuitFacts
                var facts = await _unitOfWork.Repository<Core.Models.LawSuitFacts>()
                    .FirstOrDefaultAsync(x => x.CaseId == caseId, ct);
                if (facts != null)
                {
                    summary.Step4Output = new LawSuitFactsResponseDto
                    {
                        CaseId = caseId,
                        FactsNarrative = facts.FactsNarrative
                    };
                    highestStep = 4;
                }

                // Step 5 — LawSuitLegalBasis
                var legalTexts = await _unitOfWork.Repository<Core.Models.LawSuitLegalText>()
                    .WhereAsync(x => x.CaseId == caseId, ct);
                var cassationRulings = await _unitOfWork.Repository<Core.Models.LawSuitCassationRuling>()
                    .WhereAsync(x => x.CaseId == caseId, ct);
                if (legalTexts.Any() || cassationRulings.Any())
                {
                    summary.Step5Output = new LawSuitLegalBasisResponseDto
                    {
                        CaseId = caseId,
                        LegalTexts = legalTexts.Select(t => new LegalTextDto
                        {
                            Id = t.Id,
                            LawName = t.LawName,
                            ArticleNumber = t.ArticleNumber,
                            ArticleText = t.ArticleText,
                            ApplicationNotes = t.ApplicationNotes
                        }).ToList(),
                        CassationRulings = cassationRulings.Select(r => new CassationRulingDto
                        {
                            Id = r.Id,
                            Court = r.Court,
                            AppealNumber = r.AppealNumber,
                            JudicialYear = r.JudicialYear,
                            SessionDate = r.SessionDate,
                            RulingText = r.RulingText,
                            ApplicationNotes = r.ApplicationNotes
                        }).ToList()
                    };
                    highestStep = 5;
                }

                // Step 6 — LawSuitRequests
                var requests = await _unitOfWork.Repository<Core.Models.LawSuitRequest>()
                    .WhereAsync(x => x.CaseId == caseId, ct);
                if (requests.Any())
                {
                    summary.Step6Output = new LawSuitRequestsResponseDto
                    {
                        CaseId = caseId,
                        PrincipalRequests = requests.Where(r => r.RequestType == Core.Models.LawSuitRequestType.Principal).Select(MapRequestItem).ToList(),
                        SubsidiaryRequests = requests.Where(r => r.RequestType == Core.Models.LawSuitRequestType.Subsidiary).Select(MapRequestItem).ToList(),
                        ProceduralRequests = requests.Where(r => r.RequestType == Core.Models.LawSuitRequestType.Procedural).Select(MapRequestItem).ToList()
                    };
                    highestStep = 6;
                }

                var draftJob = await _unitOfWork.Repository<Core.Models.AiJob>()
                    .FirstOrDefaultAsync(x => x.CaseId == caseId && x.StepType == Core.Enum.AiStepType.StatementOfClaimsDraft, ct);
                if (draftJob != null && !string.IsNullOrWhiteSpace(draftJob.ResultJson))
                {
                    summary.Step7Output = draftJob.ResultJson;
                    summary.UpdatedAt = draftJob.CompletedAt ?? draftJob.CreatedAt;
                    highestStep = 7;
                }

                summary.CurrentStep = highestStep >= 7 ? 7 : highestStep > 0 ? highestStep + 1 : 0;
                summary.CurrentAccessibleStep = highestStep;
                summary.LastCompletedStep = highestStep;
                summary.Status = highestStep >= 7 ? "Completed" : highestStep > 0 ? "InProgress" : "NotStarted";
                summary.IsReadOnly = false;

                summary.CanStart = highestStep == 0;
                summary.CanResumeCurrent = highestStep > 0 && highestStep < 7;
                summary.CanStartNew = highestStep > 0;
                summary.CurrentRunCreatedAt = summary.CreatedAt;

                _logger.LogInformation("Retrieved PrepStatements summary for Case {CaseId}, highest step: {Step}", caseId, highestStep);

                return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Success(summary, "تم جلب ملخص إعداد صحيفة الدعوى بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting PrepStatements summary for Case {CaseId}", caseId);
                return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب ملخص إعداد صحيفة الدعوى");
            }
        }

        public async Task<Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>> InitializeWorkflowAsync(
            Guid caseId, string lawyerId, CancellationToken ct)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                {
                    if (accessResult.Message == "القضية غير موجودة")
                        return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.NotFound, accessResult.Message);
                    return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.Forbidden, accessResult.Message);
                }

                // Return a minimal stub — PrepStatements does not persist a workflow entity,
                // step data is stored in individual tables as each step completes.
                var now = DateTime.UtcNow;
                var summary = new Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto
                {
                    CaseId = caseId,
                    RunId = caseId.ToString(),
                    CurrentStep = 0,
                    CurrentAccessibleStep = 0,
                    LastCompletedStep = 0,
                    Status = "NotStarted",
                    CreatedAt = now,
                    UpdatedAt = now
                };

                _logger.LogInformation("Initialized PrepStatements workflow stub for Case {CaseId}", caseId);

                return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Success(summary, "تم تهيئة مسار إعداد صحيفة الدعوى بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing PrepStatements workflow for Case {CaseId}", caseId);
                return Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء تهيئة مسار إعداد صحيفة الدعوى");
            }
        }

        public async Task<Result<Dtos.Workflows.WorkflowStageConflictResponseDto>> RecoverConflictAsync(
            Guid caseId, int stepNumber, string lawyerId, CancellationToken ct)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<Dtos.Workflows.WorkflowStageConflictResponseDto>.Error(HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, false, ct);
                if (!accessResult.Succeeded)
                    return Result<Dtos.Workflows.WorkflowStageConflictResponseDto>.Error(accessResult.StatusCode, accessResult.Message);

                var response = new Dtos.Workflows.WorkflowStageConflictResponseDto(
                    Guid.NewGuid().ToString(),
                    stepNumber,
                    "Recovered",
                    "تم استعادة التعارض بنجاح",
                    new List<string>(),
                    DateTime.UtcNow
                );

                return Result<Dtos.Workflows.WorkflowStageConflictResponseDto>.Success(response, "تم استعادة التعارض بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recovering conflict for PrepStatements Case {CaseId}", caseId);
                return Result<Dtos.Workflows.WorkflowStageConflictResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء استعادة التعارض");
            }
        }

        private static LawSuitRequestItemDto MapRequestItem(Core.Models.LawSuitRequest r) => new()
        {
            Id = r.Id,
            RequestNumber = r.RequestNumber,
            RequestText = r.RequestText,
            LegalReference = r.LegalReference
        };

        #endregion
    }
}
