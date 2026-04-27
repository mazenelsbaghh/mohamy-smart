namespace Lawyer.Application.Dtos.AiUsageReport
{
    public class LawyerUsageDto
    {
        public Guid LawyerId { get; set; }
        public string LawyerName { get; set; } = "";
        public decimal TotalCostUsd { get; set; }
        public decimal AiCostUsd { get; set; }
        public decimal OcrCostUsd { get; set; }
        public int TotalRequests { get; set; }
        public int AiRequests { get; set; }
        public int OcrRequests { get; set; }
    }
}
