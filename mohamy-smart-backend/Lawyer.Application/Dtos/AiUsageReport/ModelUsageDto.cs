namespace Lawyer.Application.Dtos.AiUsageReport
{
    public class ModelUsageDto
    {
        public string ModelIdentifier { get; set; } = "";
        public string DisplayName { get; set; } = "";
        public int RequestCount { get; set; }
        public decimal TotalCostUsd { get; set; }
        public long InputTokens { get; set; }
        public long OutputTokens { get; set; }
    }
}
