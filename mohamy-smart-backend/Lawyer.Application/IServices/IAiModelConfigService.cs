using Lawyer.Application.Dtos.AiModelConfig;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public interface IAiModelConfigService
    {
        Task<Result<List<AiStageModelConfigDto>>> GetAllConfigsAsync(CancellationToken cancellationToken);
        Task<Result<List<AiStageModelConfigDto>>> UpdateConfigsAsync(UpdateAiModelConfigRequest request, string adminEmail, CancellationToken cancellationToken);
        Result<List<AiModelOptionDto>> GetAvailableModels();
        Result<List<AiStageInfoDto>> GetAllStages();
    }
}
