using Lawyer.Core.Models;

namespace Lawyer.Application.Common
{
	public static class SubscriptionPlanClassifier
	{
		public const string TrialPlanName = "الباقة التجريبية";
		public const string LegacyTrialPlanName = "Free Trial";

		public static bool IsTrial(Subscription plan)
		{
			return plan.Price <= 0 || plan.Name == TrialPlanName || plan.Name == LegacyTrialPlanName;
		}

		public static bool IsPaid(Subscription plan)
		{
			return !IsTrial(plan);
		}
	}
}
