namespace Lawyer.API.Middlewares
{
	using Microsoft.AspNetCore.Http;
	using Serilog;
	using System.Diagnostics;

	public class RequestTimingMiddleware
	{
		private readonly RequestDelegate _next;
		private readonly ILogger<RequestTimingMiddleware> _logger;
		private const int ThresholdMs = 2000; // 2 seconds

		public RequestTimingMiddleware(RequestDelegate next, ILogger<RequestTimingMiddleware> logger)
		{
			_next = next;
			_logger = logger;
		}

		public async Task InvokeAsync(HttpContext context)
		{
			// Skip timing for long-lived WebSocket connections (SignalR hubs)
			if (context.Request.Path.StartsWithSegments("/hubs"))
			{
				await _next(context);
				return;
			}

			var stopwatch = Stopwatch.StartNew();
			await _next(context);
			stopwatch.Stop();

			var elapsedMs = stopwatch.ElapsedMilliseconds;
			if (elapsedMs > ThresholdMs)
			{
				var path = context.Request.Path;
				_logger.LogWarning("⚠️ Slow request detected: {Method} {Path} took {ElapsedMs}ms",
					context.Request.Method, path, elapsedMs);
			}
		}
	}

}
