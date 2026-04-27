namespace Lawyer.Application.Dtos.AdminReport
{
	public class RevenueReportDto
	{
		public decimal TotalRevenue { get; set; }
		public List<RevenueDataPointDto> DataPoints { get; set; } = new();
	}

	public class RevenueDataPointDto
	{
		public string Label { get; set; } = string.Empty;
		public decimal Amount { get; set; }
	}
}
