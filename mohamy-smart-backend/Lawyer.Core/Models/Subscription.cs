using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Core.Models
{
	public class Subscription : BaseEntity<int>
	{
		public string Name { get; set; } = string.Empty; // Basic / Pro / Enterprise
		public decimal Price { get; set; }
		public string Features { get; set; } = string.Empty;
		public int? AiRequestsLimit { get; set; }
		public int DurationDays { get; set; }
		public bool IsPopular { get; set; } = false;
		public bool ShowOnLanding { get; set; } = false;
		public decimal? YearlyPrice { get; set; }
		public int? YearlyDurationDays { get; set; }
		public ICollection<LawyerSubscription> lawyerSubscriptions { get; set; } = new List<LawyerSubscription>();
	}
}
