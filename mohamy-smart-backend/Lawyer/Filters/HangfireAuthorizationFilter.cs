using Hangfire.Dashboard;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Lawyer.Filters;

public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // Check if the user is authenticated and has the "Admin" role
        if (httpContext.User.Identity?.IsAuthenticated == true)
        {
            return httpContext.User.IsInRole("Admin");
        }

        // Hangfire dashboard does not pass Authorization headers automatically if navigated directly.
        // As a fallback, check for an auth cookie if we ever use cookies. Currently we rely on JWT.
        // For JWT in query string (if needed for Hangfire UI):
        // Note: Using query string for JWT is generally discouraged, but can be done if explicitly passed.
        // The most secure way is to ensure the Dashboard is mounted behind a proxy or accessed via a page that injects the auth.
        
        // For now, stick to standard User.Identity (populated by JWT middleware if the token is present)
        return false;
    }
}
