using System;
using System.Text;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Lawyer.Application.IServices;
using Lawyer.Core.Setting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lawyer.Infrastructure.Services
{
    public class PlusSmsSender : ISmsSender
    {
        private readonly SmsSettings _settings;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<PlusSmsSender> _logger;

        public PlusSmsSender(IOptions<SmsSettings> settings, IHttpClientFactory httpClientFactory, ILogger<PlusSmsSender> logger)
        {
            _settings = settings.Value;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<bool> SendOtpAsync(string phoneNumber, string message, string relatedBusinessId, CancellationToken cancellationToken = default)
        {
            if (!_settings.Enabled ||
                string.IsNullOrWhiteSpace(_settings.BaseUrl) ||
                _settings.BaseUrl.StartsWith("TODO", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("SMS provider is not configured. Skipping OTP SMS for {BusinessId}", relatedBusinessId);
                return false;
            }

            var normalizedPhone = NormalizeEgyptianPhone(phoneNumber);

            try
            {
                var client = _httpClientFactory.CreateClient("PlusSms");
                _logger.LogInformation("Sending OTP SMS to {Phone} via {Url}", normalizedPhone, _settings.BaseUrl);

                // 1. Try POST (FormUrlEncoded)
                var dict = new System.Collections.Generic.Dictionary<string, string>
                {
                    { "username", _settings.Username },
                    { "password", _settings.Password },
                    { "sendername", _settings.SenderName },
                    { "message", message },
                    { "mobiles", normalizedPhone }
                };

                using var postContent = new System.Net.Http.FormUrlEncodedContent(dict);
                using var postResponse = await client.PostAsync(_settings.BaseUrl, postContent, cancellationToken);

                System.Net.Http.HttpResponseMessage finalResponse = postResponse;

                // 2. Fallback to GET if POST is not allowed/supported (e.g., 405 Method Not Allowed)
                if (postResponse.StatusCode == HttpStatusCode.MethodNotAllowed || 
                    postResponse.StatusCode == HttpStatusCode.NotFound || 
                    postResponse.StatusCode == HttpStatusCode.BadRequest)
                {
                    _logger.LogWarning("OTP SMS POST failed with status {StatusCode}, falling back to GET...", postResponse.StatusCode);
                    
                    var query =
                        $"username={Uri.EscapeDataString(_settings.Username)}" +
                        $"&password={Uri.EscapeDataString(_settings.Password)}" +
                        $"&sendername={Uri.EscapeDataString(_settings.SenderName)}" +
                        $"&message={Uri.EscapeDataString(message)}" +
                        $"&mobiles={Uri.EscapeDataString(normalizedPhone)}";

                    var separator = _settings.BaseUrl.Contains('?') ? "&" : "?";
                    var requestUri = $"{_settings.BaseUrl}{separator}{query}";

                    finalResponse = await client.GetAsync(requestUri, cancellationToken);
                }

                if (!finalResponse.IsSuccessStatusCode)
                {
                    _logger.LogWarning("OTP SMS failed for {BusinessId} with status {StatusCode}", relatedBusinessId, finalResponse.StatusCode);
                    return false;
                }

                var body = await finalResponse.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogInformation("OTP SMS sent for {BusinessId}. Provider response: {ResponseBody}", relatedBusinessId, body);
                
                if (finalResponse != postResponse)
                {
                    finalResponse.Dispose();
                }
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OTP SMS send failed for {BusinessId}", relatedBusinessId);
                return false;
            }
        }

        private static string NormalizeEgyptianPhone(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return phone;

            var digits = new StringBuilder(phone.Length);
            foreach (var ch in phone)
            {
                if (ch >= '\u0660' && ch <= '\u0669')
                    digits.Append((char)('0' + (ch - '\u0660')));
                else if (ch >= '\u06F0' && ch <= '\u06F9')
                    digits.Append((char)('0' + (ch - '\u06F0')));
                else if (char.IsDigit(ch))
                    digits.Append(ch);
            }

            phone = digits.ToString();

            if (phone.StartsWith("00"))
                phone = phone[2..];

            if (phone.StartsWith("01") && phone.Length == 11)
                return "2" + phone;

            if (phone.StartsWith("1") && phone.Length == 10)
                return "20" + phone;

            return phone;
        }
    }
}
