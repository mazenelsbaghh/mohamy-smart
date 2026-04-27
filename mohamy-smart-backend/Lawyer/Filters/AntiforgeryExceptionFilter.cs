using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace Lawyer.Filters
{
    /// <summary>
    /// Custom antiforgery filter that replaces AutoValidateAntiforgeryTokenAttribute.
    /// On validation failure, returns a JSON body containing the keyword "antiforgery"
    /// so the frontend CSRF retry interceptor can detect and auto-recover.
    ///
    /// IMPORTANT: Respects [IgnoreAntiforgeryToken] by checking whether this filter
    /// is the closest IAntiforgeryPolicy in the filter pipeline.  If a more specific
    /// policy exists (e.g. [IgnoreAntiforgeryToken] on the action/controller), the
    /// validation is skipped — matching the behaviour of the stock
    /// AutoValidateAntiforgeryTokenAttribute.
    /// </summary>
    public class JsonAutoValidateAntiforgeryFilter : IAsyncAuthorizationFilter, IAntiforgeryPolicy
    {
        private readonly IAntiforgery _antiforgery;
        private readonly ILogger<JsonAutoValidateAntiforgeryFilter> _logger;

        public JsonAutoValidateAntiforgeryFilter(IAntiforgery antiforgery, ILogger<JsonAutoValidateAntiforgeryFilter> logger)
        {
            _antiforgery = antiforgery;
            _logger = logger;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            if (!ShouldValidate(context))
                return;

            try
            {
                await _antiforgery.ValidateRequestAsync(context.HttpContext);
            }
            catch (AntiforgeryValidationException ex)
            {
                _logger.LogWarning(
                    "Antiforgery validation failed for {Method} {Path}: {Message}",
                    context.HttpContext.Request.Method,
                    context.HttpContext.Request.Path,
                    ex.Message);

                context.Result = new BadRequestObjectResult(new
                {
                    succeeded = false,
                    statusCode = 400,
                    message = "Antiforgery token validation failed. Please retry.",
                    errors = new[] { "antiforgery" }
                });
            }
        }

        /// <summary>
        /// Mirrors the logic in the stock AutoValidateAntiforgeryTokenAttribute:
        /// 1. Skip safe HTTP methods (GET, HEAD, OPTIONS, TRACE)
        /// 2. Skip if a MORE SPECIFIC IAntiforgeryPolicy exists on the action/controller
        ///    (e.g. [IgnoreAntiforgeryToken]).  The most specific policy is the LAST one
        ///    in the Filters list because endpoint-level attributes are added after globals.
        /// </summary>
        private bool ShouldValidate(AuthorizationFilterContext context)
        {
            // 1. Safe methods don't need CSRF validation
            var method = context.HttpContext.Request.Method;
            if (HttpMethods.IsGet(method)
                || HttpMethods.IsHead(method)
                || HttpMethods.IsOptions(method)
                || HttpMethods.IsTrace(method))
            {
                return false;
            }

            // 2. Respect [IgnoreAntiforgeryToken]:
            //    Walk the filter list from the end (most specific) to find the closest
            //    IAntiforgeryPolicy.  If it is NOT this instance, a more specific policy
            //    (like [IgnoreAntiforgeryToken]) overrides us → skip validation.
            for (var i = context.Filters.Count - 1; i >= 0; i--)
            {
                if (context.Filters[i] is IAntiforgeryPolicy)
                {
                    return ReferenceEquals(this, context.Filters[i]);
                }
            }

            return true;
        }
    }
}
