using System.Net;

namespace Lawyer.Core.Exceptions
{
    public class Result<T>
    {
        public Result()
        {
        }

        // HTTP status code of the response
        public HttpStatusCode StatusCode { get; set; }

        // Additional metadata related to the response
        public Dictionary<string, object>? Meta { get; set; }

        // Indicates whether the request was successful
        public bool Succeeded { get; set; }

        // Message providing additional information about the response
        public string? Message { get; set; }

        // List of errors encountered during the request
        public List<string> Errors { get; set; } = new List<string>();

        // Data payload of the response
        public T? Data { get; set; }

        // === SUCCESS RESPONSES ===

        // Generic success response with data
        public static Result<T> Success(T data, string? message = null, Dictionary<string, object>? meta = null) => new Result<T>
        {
            Data = data,
            Succeeded = true,
            StatusCode = HttpStatusCode.OK,
            Message = message,
            Meta = meta
        };

        // Success response with an empty list
        public static Result<T> SuccessWithEmptyList(string? message = null, Dictionary<string, object>? meta = null) => new Result<T>
        {
            Succeeded = true,
            StatusCode = HttpStatusCode.OK,
            Message = message,
            Meta = meta
        };

        // Success response for boolean operations
        public static Result<bool> Success(bool result, string? message = null) => new Result<bool>
        {
            Data = result,
            Succeeded = result,
            StatusCode = result ? HttpStatusCode.OK : HttpStatusCode.BadRequest,
            Message = message
        };

        // Created response
        public static Result<T> Created(T data, Dictionary<string, object>? meta = null) => new Result<T>
        {
            Data = data,
            Succeeded = true,
            StatusCode = HttpStatusCode.Created,
            Meta = meta
        };

        // === ERROR RESPONSES ===

        // Generic error response
        public static Result<T> Error(HttpStatusCode statusCode, string? message, List<string>? errors = null) => new Result<T>
        {
            Succeeded = false,
            StatusCode = statusCode,
            Message = message,
            Errors = errors ?? new List<string>()
        };


        // Error response for failed boolean operations
        public static Result<bool> Failure(bool result, string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest) => new Result<bool>
        {
            Data = result,
            Succeeded = false,
            StatusCode = statusCode,
            Message = message
        };




        // Deleted response
        public static Result<T> Deleted(string? message = null) => new Result<T>
        {
            Succeeded = true,
            StatusCode = HttpStatusCode.OK,
            Message = message
        };
    }
}
