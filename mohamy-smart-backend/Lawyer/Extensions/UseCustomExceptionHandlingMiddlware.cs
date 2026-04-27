using Lawyer.Middlewares;

namespace Lawyer.API.Extensions
{
    public static class CustomExceptionHandlingMiddlewareExtensions 
    {
        public static IApplicationBuilder UseCustomExceptionHandling(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ExceptionMiddleware>();
        }
    }
}
