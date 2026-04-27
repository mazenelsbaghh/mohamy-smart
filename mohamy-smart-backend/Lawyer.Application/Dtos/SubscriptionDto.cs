using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Dtos
{
	public class SubscriptionDto
	{
		public int Id { get; set; }
		public string Name { get; set; } = default!;
		public string Features { get; set; } = string.Empty;

		public decimal Price { get; set; }
		public int AiRequestsLimit { get; set; }
		public int DurationDays { get; set; }
		public bool IsActive { get; set; }
		public bool IsPopular { get; set; }
		public bool ShowOnLanding { get; set; }
		public decimal? YearlyPrice { get; set; }
		public int? YearlyDurationDays { get; set; }
		public bool HasYearlyOption => YearlyPrice.HasValue;
	}


	public class CreateSubscriptionDto
	{
		public string Name { get; set; } = default!;
		public string Features { get; set; } = string.Empty;

		public decimal Price { get; set; }
		public int AiRequestsLimit { get; set; }
		public int DurationDays { get; set; }
		public bool IsPopular { get; set; }
		public bool ShowOnLanding { get; set; }
		public decimal? YearlyPrice { get; set; }
		public int? YearlyDurationDays { get; set; }
	}

	public class UpdateSubscriptionDto
	{
		public string? Name { get; set; }
		public string? Features { get; set; }
		public decimal? Price { get; set; }
		public int? AiRequestsLimit { get; set; }
		public int? DurationDays { get; set; }
		public bool? IsActive { get; set; }
		public bool? IsPopular { get; set; }
		public bool? ShowOnLanding { get; set; }
		public decimal? YearlyPrice { get; set; }
		public int? YearlyDurationDays { get; set; }
	}

	public class LawyerSubscriptionDto
	{
		public Guid LawyerId { get; set; }
		public string LawyerName { get; set; } = string.Empty;
		public string PlanName { get; set; } = string.Empty;
		public DateTime StartDate { get; set; }
		public DateTime EndDate { get; set; }
		public int UsedAiRequests { get; set; }
		public int Limit { get; set; }
		public bool IsActive { get; set; }
	}

}
