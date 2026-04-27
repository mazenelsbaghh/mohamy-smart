namespace Lawyer.Application.Dtos.AiUsageReport
{
    public class AiUsageSummaryDto
    {
        public decimal TotalCostUsd { get; set; }
        public decimal AiCostUsd { get; set; }
        public decimal OcrCostUsd { get; set; }
        public int TotalRequests { get; set; }
        public int AiRequests { get; set; }
        public int OcrRequests { get; set; }
        public long TotalInputTokens { get; set; }
        public long TotalOutputTokens { get; set; }
        public List<ModelUsageDto> PerModel { get; set; } = [];
    }
}
