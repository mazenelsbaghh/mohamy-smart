using Microsoft.EntityFrameworkCore;
using Lawyer.Core.Exceptions;
using System.Net;
using System.Text.Json;

namespace Lawyer.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            Result<string> response;
            context.Response.ContentType = "application/json";

            switch (exception)
            {
                case ForbiddenException forbiddenEx:
                    context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                    response = ApiExceptionResponse.Forbidden<string>(forbiddenEx.Message);
                    break;

                case KeyNotFoundException keyNotFoundEx:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response = ApiExceptionResponse.NotFound<string>(keyNotFoundEx.Message);
                    break;

                case UnauthorizedAccessException unauthorizedEx:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response = ApiExceptionResponse.Unauthorized<string>(unauthorizedEx.Message);
                    break;

                case SchemaValidationException schemaValidationEx:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response = ApiExceptionResponse.BadRequest<string>(schemaValidationEx.Message);
                    break;

                case DbUpdateException dbUpdateEx:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    _logger.LogError(dbUpdateEx, "Database update error.");
                    response = ApiExceptionResponse.ServerError<string>("حدث خطأ في قاعدة البيانات. يرجى المحاولة لاحقاً.");
                    break;
                case OperationCanceledException:
                    _logger.LogInformation("Request was cancelled by the client.");
                    context.Response.StatusCode = 499; // Client Closed Request
                    response = ApiExceptionResponse.ServerError<string>("تم إلغاء الطلب.");
                    break;

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    _logger.LogError(exception, "An unhandled exception has occurred.");
                    response = ApiExceptionResponse.ServerError<string>("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
                    break;
            }

            var result = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(result);
        }
    }
}
