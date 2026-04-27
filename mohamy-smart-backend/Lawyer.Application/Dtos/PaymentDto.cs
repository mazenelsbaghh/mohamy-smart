using System;

namespace Lawyer.Application.Dtos
{
	public class InitiatePaymentResponseDto
	{
		public Guid PaymentId { get; set; }
		public string PaymentUrl { get; set; } = string.Empty;
		public string Status { get; set; } = string.Empty;
	}

	public class PaymentStatusDto
	{
		public Guid PaymentId { get; set; }
		public string Status { get; set; } = string.Empty;
		public bool SubscriptionActivated { get; set; }
		public string ActivePlanName { get; set; } = string.Empty;
	}

	public class PaymentHistoryDto
	{
		public Guid PaymentId { get; set; }
		public decimal Amount { get; set; }
		public string PaymentMethod { get; set; } = string.Empty;
		public string Status { get; set; } = string.Empty;
		public DateTime CreatedAt { get; set; }
	}

	public class InitiatePaymentRequestDto
	{
		public int SubscriptionId { get; set; }
		public string PaymentMethod { get; set; } = "card";
		public string BillingCycle { get; set; } = "monthly";
	}
}
