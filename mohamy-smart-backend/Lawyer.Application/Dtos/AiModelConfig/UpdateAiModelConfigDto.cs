using System.ComponentModel.DataAnnotations;

namespace Lawyer.Application.Dtos.AiModelConfig
{
    public class UpdateAiModelConfigRequest
    {
        [Required]
        public List<UpdateAiModelConfigItem> Configs { get; set; } = new();
    }

    public class UpdateAiModelConfigItem
    {
        [Range(0, int.MaxValue)]
        public int StepType { get; set; }

        [Required]
        [StringLength(50)]
        public string ModelIdentifier { get; set; } = string.Empty;
    }
}
