namespace Lawyer.API.Middlewares
{
	using Microsoft.AspNetCore.Http;
	using Serilog.Context;

	public class CorrelationIdMiddleware
	{
		private const string CorrelationIdHeader = "X-Correlation-ID";
		private readonly RequestDelegate _next;

		public CorrelationIdMiddleware(RequestDelegate next) => _next = next;

		public async Task InvokeAsync(HttpContext context)
		{
			var correlationId = context.Request.Headers[CorrelationIdHeader].FirstOrDefault()
								?? Guid.NewGuid().ToString();

			context.Items["CorrelationId"] = correlationId;

			// Attach to the response headers for client visibility
			context.Response.OnStarting(() =>
			{
				context.Response.Headers[CorrelationIdHeader] = correlationId;
				return Task.CompletedTask;
			});

			// Push to Serilog context
			using (LogContext.PushProperty("CorrelationId", correlationId))
			{
				await _next(context);
			}
		}
	}

}
