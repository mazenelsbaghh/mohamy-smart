namespace Lawyer.Core.Setting
{
	public class PaymobSettings
	{
		public string APIKey { get; set; } = string.Empty;
		public string SecretKey { get; set; } = string.Empty;
		public string PublicKey { get; set; } = string.Empty;
		public string HMAC { get; set; } = string.Empty;
		public string CardIntegrationId { get; set; } = string.Empty;
		public string MobileIntegrationId { get; set; } = string.Empty;
		public string CallbackBaseUrl { get; set; } = string.Empty;         // Your backend public URL (e.g. https://api.yoursite.com)
	}
}
