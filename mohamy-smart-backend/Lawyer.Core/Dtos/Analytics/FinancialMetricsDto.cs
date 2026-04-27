namespace Lawyer.Core.Dtos.Analytics
{
    public class FinancialMetricsDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRecurringRevenue { get; set; }
        public decimal TotalRefunds { get; set; }
        public decimal AverageRevenuePerUser { get; set; }
    }
}
