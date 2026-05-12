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
        public int ChargedPointTransactions { get; set; }
        public int NoChargePointTransactions { get; set; }
        public int RestoredPointTransactions { get; set; }
        public int ChargedPoints { get; set; }
        public int RestoredPoints { get; set; }
        public long TotalInputTokens { get; set; }
        public long TotalOutputTokens { get; set; }
        public List<ModelUsageDto> PerModel { get; set; } = [];
    }
}
