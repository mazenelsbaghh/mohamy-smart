namespace Lawyer.Core.Dtos.Analytics
{
    public class SubscriptionLifecycleDto
    {
        public int TotalNewSubscribers { get; set; }
        public int OneMonthChurners { get; set; }
        public int Renewals { get; set; }
        public int Upgrades { get; set; }
        public int Refunds { get; set; }
    }
}
