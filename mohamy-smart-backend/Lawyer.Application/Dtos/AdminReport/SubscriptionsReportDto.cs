namespace Lawyer.Application.Dtos.AdminReport
{
	public class SubscriptionsReportDto
	{
		public int TotalSubscriptions { get; set; }
		public int TotalActive { get; set; }
		public int TotalInactive { get; set; }
		public List<PlanCountDto> CountPerPlan { get; set; } = new();
		public decimal TotalRevenue { get; set; }
		public int ChurnedSubscriptions { get; set; }
		public Lawyer.Application.Models.PaginatedList<SubscriptionLedgerDto>? Ledger { get; set; }
	}

	public class PlanCountDto
	{
		public string PlanName { get; set; } = string.Empty;
		public int Count { get; set; }
	}

	public class SubscriptionLedgerDto
	{
		public string TransactionId { get; set; } = string.Empty;
		public decimal Amount { get; set; }
		public DateTime Date { get; set; }
		public string Status { get; set; } = string.Empty;
	}
}
