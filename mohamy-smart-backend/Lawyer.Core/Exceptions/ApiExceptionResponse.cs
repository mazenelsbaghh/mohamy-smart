using System.Collections.Generic;
using System.Net;

namespace Lawyer.Core.Exceptions
{
    public class ApiExceptionResponse
    {
        public ApiExceptionResponse() { }

        private static Result<T> CreateErrorResponse<T>(HttpStatusCode statusCode, string? message)
        {
            return Result<T>.Error(statusCode, message);
        }

        private static Result<bool> CreateBooleanErrorResponse(HttpStatusCode statusCode, bool result, string? message)
        {
            return Result<bool>.Failure(result, message ?? string.Empty, statusCode);
        }

        public static Result<T> BadRequest<T>(string? message = null)
        {
            return CreateErrorResponse<T>(HttpStatusCode.BadRequest, message);
        }

        public static Result<bool> BadRequest(bool result, string? message = null)
        {
            return CreateBooleanErrorResponse(HttpStatusCode.BadRequest, result, message);
        }

        public static Result<T> ServerError<T>(string? message = null)
        {
            return CreateErrorResponse<T>(HttpStatusCode.InternalServerError, message);
        }

        public static Result<bool> ServerError(bool result, string? message = null)
        {
            return CreateBooleanErrorResponse(HttpStatusCode.InternalServerError, result, message);
        }

        public static Result<T> Unauthorized<T>(string? message = null)
        {
            return CreateErrorResponse<T>(HttpStatusCode.Unauthorized, message);
        }

        public static Result<T> Forbidden<T>(string? message = null)
        {
            return CreateErrorResponse<T>(HttpStatusCode.Forbidden, message);
        }

        public static Result<T> NotFound<T>(string? message = null)
        {
            return CreateErrorResponse<T>(HttpStatusCode.NotFound, message);
        }

        public static Result<bool> NotFound(bool result, string? message = null)
        {
            return CreateBooleanErrorResponse(HttpStatusCode.NotFound, result, message);
        }

        public static Result<T> UnprocessableEntity<T>(string? message = null)
        {
            return CreateErrorResponse<T>(HttpStatusCode.UnprocessableEntity, message);
        }

        public static Result<T> Success<T>(T entity, string? message = null, Dictionary<string, object>? meta = null)
        {
            return Result<T>.Success(entity, message, meta);
        }

        public static Result<bool> Success(bool result, string? message = null, Dictionary<string, object>? meta = null)
        {
            return Result<bool>.Success(result, message);
        }

        public static Result<T> SuccessWithEmptyList<T>(string? message = null, Dictionary<string, object>? meta = null)
        {
            return Result<T>.SuccessWithEmptyList(message);
        }

        public static Result<T> Created<T>(T entity, Dictionary<string, object>? meta = null)
        {
            return Result<T>.Created(entity, meta);
        }

        public static Result<T> Deleted<T>(string? message = null)
        {
            return Result<T>.Deleted(message);
        }
    }
}
