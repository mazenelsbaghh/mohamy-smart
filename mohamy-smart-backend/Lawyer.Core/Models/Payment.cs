using Lawyer.Core.Enum;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lawyer.Core.Models
{
	public class Payment : BaseEntity<Guid>
	{
		public Guid LawyerId { get; set; }
		public int SubscriptionId { get; set; }

		[Column(TypeName = "decimal(18,2)")]
		public decimal Amount { get; set; }
		public string Currency { get; set; } = "EGP";
		public string PaymentMethod { get; set; } = string.Empty;           // "card" or "wallet"
		public string TransactionId { get; set; } = string.Empty;            // special_reference / merchant_order_id
		public string? PaymobTransactionId { get; set; }     // Paymob's transaction ID (from callback)
		public string BillingCycle { get; set; } = "monthly";
		public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
		public string? CallbackPayload { get; set; }        // Raw JSON from Paymob callback for audit/debugging

		// Navigation
		public Lawyer Lawyer { get; set; } = null!;
		public Subscription Subscription { get; set; } = null!;
	}
}
