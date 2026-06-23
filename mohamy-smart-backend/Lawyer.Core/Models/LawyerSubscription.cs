using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Core.Models
{
	public class LawyerSubscription : BaseEntity<Guid>
	{
		public int SubscriptionId { get; set; }
		public Guid LawyerId { get; set; }
		public int UsedAiRequests { get; set; } = 0;
		public int AiRequestsAdjustment { get; set; } = 0;
        public DateTime StartDate { get; set; }
		public DateTime EndDate { get; set; }
		public Subscription Subscription { get; set; } = null!;
		public Lawyer Lawyer { get; set; } = null!;

		public int GetEffectiveAiRequestsLimit()
		{
			var planLimit = Subscription.AiRequestsLimit ?? 0;
			return (int)Math.Clamp((long)planLimit + AiRequestsAdjustment, 0, int.MaxValue);
		}
	}
}
