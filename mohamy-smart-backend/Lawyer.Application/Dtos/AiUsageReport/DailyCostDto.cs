namespace Lawyer.Application.Dtos.AiUsageReport
{
    public class DailyCostDto
    {
        public DateTime Date { get; set; }
        public decimal AiCost { get; set; }
        public decimal OcrCost { get; set; }
        public int Requests { get; set; }
    }
}
