using Lawyer.Core.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Lawyer.Filters
{
    public sealed class RequireBrowserOtpRequestAttribute : TypeFilterAttribute
    {
        public RequireBrowserOtpRequestAttribute() : base(typeof(RequireBrowserOtpRequestFilter))
        {
        }
    }

    public sealed class RequireBrowserOtpRequestFilter : IAsyncActionFilter
    {
        private static readonly string[] SuspiciousUserAgentTokens =
        {
            "python-requests",
            "python/",
            "curl/",
            "wget/",
            "httpclient",
            "aiohttp",
            "scrapy"
        };

        private readonly IConfiguration _configuration;
        private readonly ILogger<RequireBrowserOtpRequestFilter> _logger;

        public RequireBrowserOtpRequestFilter(
            IConfiguration configuration,
            ILogger<RequireBrowserOtpRequestFilter> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (!(_configuration.GetValue<bool?>("OtpSecurity:RequireBrowserRequest") ?? true))
            {
                await next();
                return;
            }

            var request = context.HttpContext.Request;
            if (HttpMethods.IsOptions(request.Method))
            {
                await next();
                return;
            }

            var allowedOrigins = _configuration.GetSection("CorsOrigins").Get<string[]>() ?? Array.Empty<string>();
            var origin = request.Headers.Origin.FirstOrDefault();
            var refererOrigin = TryGetOrigin(request.Headers.Referer.FirstOrDefault());

            if (!IsAllowedOrigin(origin, refererOrigin, allowedOrigins))
            {
                Reject(context, "missing-or-invalid-origin");
                return;
            }

            if (!string.Equals(request.Headers["X-Requested-With"].FirstOrDefault(), "XMLHttpRequest", StringComparison.Ordinal))
            {
                Reject(context, "missing-x-requested-with");
                return;
            }

            var userAgent = request.Headers.UserAgent.ToString();
            if (string.IsNullOrWhiteSpace(userAgent) || SuspiciousUserAgentTokens.Any(token => userAgent.Contains(token, StringComparison.OrdinalIgnoreCase)))
            {
                Reject(context, "suspicious-user-agent");
                return;
            }

            await next();
        }

        private static bool IsAllowedOrigin(string? origin, string? refererOrigin, IReadOnlyCollection<string> allowedOrigins)
        {
            if (allowedOrigins.Count == 0)
                return false;

            if (!string.IsNullOrWhiteSpace(origin))
                return allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase);

            return !string.IsNullOrWhiteSpace(refererOrigin) &&
                   allowedOrigins.Contains(refererOrigin, StringComparer.OrdinalIgnoreCase);
        }

        private static string? TryGetOrigin(string? referer)
        {
            if (string.IsNullOrWhiteSpace(referer) || !Uri.TryCreate(referer, UriKind.Absolute, out var uri))
                return null;

            return uri.GetLeftPart(UriPartial.Authority);
        }

        private void Reject(ActionExecutingContext context, string reason)
        {
            _logger.LogWarning(
                "Blocked OTP request. Reason={Reason}, IP={RemoteIp}, Origin={Origin}, Referer={Referer}, UserAgent={UserAgent}",
                reason,
                context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                context.HttpContext.Request.Headers.Origin.FirstOrDefault() ?? "",
                context.HttpContext.Request.Headers.Referer.FirstOrDefault() ?? "",
                context.HttpContext.Request.Headers.UserAgent.ToString());

            context.Result = new ObjectResult(Result<string>.Error(
                System.Net.HttpStatusCode.Forbidden,
                "تم رفض طلب رمز التحقق. يرجى استخدام التطبيق من المتصفح."))
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }
    }
}
