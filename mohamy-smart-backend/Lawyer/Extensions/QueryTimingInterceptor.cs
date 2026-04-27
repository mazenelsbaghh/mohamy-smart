using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Data.Common;
using System.Diagnostics;

public class QueryTimingInterceptor : DbCommandInterceptor
{
	public override async ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
		DbCommand command,
		CommandEventData eventData,
		InterceptionResult<DbDataReader> result,
		CancellationToken cancellationToken = default)
	{
		var stopwatch = Stopwatch.StartNew();
		var executionResult = await base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
		stopwatch.Stop();

		Console.WriteLine($"[SQL] Took {stopwatch.ElapsedMilliseconds} ms\n{command.CommandText}");

		return executionResult;
	}

	public override async ValueTask<DbDataReader> ReaderExecutedAsync(
		DbCommand command,
		CommandExecutedEventData eventData,
		DbDataReader result,
		CancellationToken cancellationToken = default)
	{
		Console.WriteLine($"[SQL Completed] Took {eventData.Duration.TotalMilliseconds} ms\n{command.CommandText}");
		return await base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
	}
}
