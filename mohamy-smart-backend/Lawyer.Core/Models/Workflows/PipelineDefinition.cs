using Lawyer.Core.Enum;

namespace Lawyer.Core.Models.Workflows
{
    public class PipelineDefinition
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int TotalSteps { get; set; }
        public int CategoryOrder { get; set; }
        public List<PipelineStepDefinition> Steps { get; set; } = new();
    }

    public class PipelineStepDefinition
    {
        public AiStepType StepType { get; set; }
        public string DisplayName { get; set; } = string.Empty;
    }
}
