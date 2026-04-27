namespace Lawyer.Application.Dtos.AiUsageReport
{
    public class StepUsageDto
    {
        public int StepType { get; set; }
        public string StepName { get; set; } = "";
        public string ModelDisplayName { get; set; } = "";
        public int RequestCount { get; set; }
        public decimal TotalCostUsd { get; set; }
    }
}
