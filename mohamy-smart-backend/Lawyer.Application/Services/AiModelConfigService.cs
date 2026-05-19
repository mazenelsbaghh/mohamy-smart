using Lawyer.Application.Common.Interface;
using Lawyer.Application.Dtos.AiModelConfig;
using Lawyer.Application.IServices;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Net;
using Lawyer.Application.Services.Workflows;

namespace Lawyer.Application.Services
{
    public class AiModelConfigService : IAiModelConfigService
    {
        private const string AllConfigsCacheKey = "AllAiModelConfigs";
        private const string Gemini35FlashDocumentationUrl = "https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash";
        private const string Gemini35FlashPricingNotes = "Paid tier: input $1.50/1M tokens, output including thinking tokens $9.00/1M tokens. Context caching $0.15/1M tokens plus $1.00/1M tokens/hour storage. Google Search and Maps grounding: free tier unavailable; paid tier includes 5,000 prompts/month free shared across Gemini 3 then $14/1,000 search queries. Used to improve products: free tier yes, paid tier no.";
        private readonly IApplicationDbContext _db;
        private readonly IMemoryCache _cache;
        private readonly ILogger<AiModelConfigService> _logger;

        public AiModelConfigService(
            IApplicationDbContext db,
            IMemoryCache cache,
            ILogger<AiModelConfigService> logger)
        {
            _db = db;
            _cache = cache;
            _logger = logger;
        }

        public async Task<Result<List<AiStageModelConfigDto>>> GetAllConfigsAsync(CancellationToken cancellationToken)
        {
            try
            {
                if (_cache.TryGetValue(AllConfigsCacheKey, out List<AiStageModelConfigDto>? cached) && cached != null)
                    return Result<List<AiStageModelConfigDto>>.Success(cached);

                var configs = await _db.AiStageModelConfigs.AsNoTracking().ToListAsync(cancellationToken);
                var configMap = configs.ToDictionary(c => c.StepType);

                var result = PipelineRegistry.GetAllIncludedStages().Select(sd =>
                {
                    configMap.TryGetValue(sd.StepType, out var config);
                    var modelIdentifier = config?.ModelIdentifier ?? "gemini-3.5-flash";
                    return new AiStageModelConfigDto(
                        (int)sd.StepType,
                        sd.StepType.ToString(),
                        sd.DisplayName,
                        sd.Category,
                        modelIdentifier,
                        AiModelTypeExtensions.ToModelDisplayName(modelIdentifier),
                        config?.UpdatedAt ?? DateTime.MinValue,
                        config?.UpdatedBy
                    );
                }).ToList();

                _cache.Set(AllConfigsCacheKey, result, TimeSpan.FromHours(1));

                return Result<List<AiStageModelConfigDto>>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get AI model configurations");
                return Result<List<AiStageModelConfigDto>>.Error(HttpStatusCode.InternalServerError, "فشل في تحميل إعدادات النماذج");
            }
        }

        public async Task<Result<List<AiStageModelConfigDto>>> UpdateConfigsAsync(
            UpdateAiModelConfigRequest request, string adminEmail, CancellationToken cancellationToken)
        {
            var validationError = ValidateUpdateRequest(request);
            if (validationError != null)
                return Result<List<AiStageModelConfigDto>>.Error(HttpStatusCode.BadRequest, validationError);

            try
            {
                var stepTypes = request.Configs.Select(c => (AiStepType)c.StepType).ToList();
                var existingConfigs = await _db.AiStageModelConfigs
                    .Where(c => stepTypes.Contains(c.StepType))
                    .ToListAsync(cancellationToken);

                var existingMap = existingConfigs.ToDictionary(c => c.StepType);

                foreach (var item in request.Configs)
                {
                    var stepType = (AiStepType)item.StepType;
                    if (existingMap.TryGetValue(stepType, out var config))
                    {
                        config.ModelIdentifier = item.ModelIdentifier;
                        config.UpdatedAt = DateTime.UtcNow;
                        config.UpdatedBy = adminEmail;
                    }
                    else
                    {
                        var newConfig = new Lawyer.Core.Models.AiStageModelConfig
                        {
                            StepType = stepType,
                            ModelIdentifier = item.ModelIdentifier,
                            UpdatedAt = DateTime.UtcNow,
                            UpdatedBy = adminEmail
                        };
                        _db.AiStageModelConfigs.Add(newConfig);
                    }
                }

                await _db.SaveChangesAsync(cancellationToken);

                foreach (var item in request.Configs)
                {
                    var cacheKey = $"AiModelConfig_{item.StepType}";
                    _cache.Remove(cacheKey);
                }
                _cache.Remove(AllConfigsCacheKey);

                _logger.LogInformation("AI model configurations updated by {Admin}", adminEmail);

                return await GetAllConfigsAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update AI model configurations");
                return Result<List<AiStageModelConfigDto>>.Error(HttpStatusCode.InternalServerError, "فشل في حفظ إعدادات النماذج");
            }
        }

        public Result<List<AiModelOptionDto>> GetAvailableModels()
        {
            var models = Enum.GetValues<AiModelType>().Select(mt => new AiModelOptionDto(
                mt.ToModelIdentifier(),
                mt.ToDisplayName(),
                mt.ToDescription(),
                mt == AiModelType.Gemini35Flash ? Gemini35FlashDocumentationUrl : null,
                mt == AiModelType.Gemini35Flash ? Gemini35FlashPricingNotes : null
            )).ToList();

            return Result<List<AiModelOptionDto>>.Success(models);
        }

        public Result<List<AiStageInfoDto>> GetAllStages()
        {
            var stages = PipelineRegistry.GetAllIncludedStages().Select(sd => new AiStageInfoDto(
                (int)sd.StepType,
                sd.StepType.ToString(),
                sd.DisplayName,
                sd.Category,
                sd.CategoryOrder
            )).ToList();

            return Result<List<AiStageInfoDto>>.Success(stages);
        }

        private string? ValidateUpdateRequest(UpdateAiModelConfigRequest request)
        {
            if (request.Configs == null || request.Configs.Count == 0)
                return "قائمة الإعدادات فارغة";

            var validStepTypes = Enum.GetValues<AiStepType>().Cast<int>().ToHashSet();
            var validModels = AiModelTypeExtensions.ValidModelIdentifiers;

            foreach (var item in request.Configs)
            {
                if (!validStepTypes.Contains(item.StepType))
                    return $"قيمة مرحلة غير صالحة: {item.StepType}";

                if (!validModels.Contains(item.ModelIdentifier))
                    return $"قيمة نموذج غير صالحة: {item.ModelIdentifier}";
            }

            var duplicates = request.Configs.GroupBy(c => c.StepType).Where(g => g.Count() > 1).ToList();
            if (duplicates.Count > 0)
                return $"مراحل مكررة في الطلب: {string.Join(", ", duplicates.Select(d => d.Key))}";

            return null;
        }
    }
}
