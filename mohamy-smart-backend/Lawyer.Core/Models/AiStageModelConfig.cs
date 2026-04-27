using Lawyer.Core.Enum;

namespace Lawyer.Core.Models
{
    public class AiStageModelConfig
    {
        public int Id { get; set; }
        public AiStepType StepType { get; set; }
        public string ModelIdentifier { get; set; } = "gemini-3-flash-preview-pro";
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
    }
}
