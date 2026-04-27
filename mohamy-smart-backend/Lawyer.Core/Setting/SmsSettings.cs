namespace Lawyer.Core.Setting
{
    public class SmsSettings
    {
        public string BaseUrl { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public bool Enabled { get; set; }
    }
}
