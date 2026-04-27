using System.Linq.Expressions;

namespace Lawyer.Application.IServices
{
	/// <summary>
	/// Abstraction over a background job queue (currently Hangfire).
	/// Keeps application code free of direct dependency on Hangfire so the
	/// implementation can be swapped or mocked in tests.
	/// </summary>
	public interface IBackgroundJobService
	{
		/// <summary>
		/// Enqueue a fire-and-forget job to run as soon as a worker is free.
		/// </summary>
		string Enqueue(Expression<Action> job);

		/// <summary>
		/// Enqueue a fire-and-forget job that resolves a scoped service from DI.
		/// </summary>
		string Enqueue<T>(Expression<Action<T>> job);

		/// <summary>
		/// Enqueue an async fire-and-forget job that resolves a scoped service from DI.
		/// </summary>
		string Enqueue<T>(Expression<Func<T, Task>> job);

		/// <summary>
		/// Schedule a job to run after the given delay.
		/// </summary>
		string Schedule(Expression<Action> job, TimeSpan delay);

		/// <summary>
		/// Schedule a job with DI-resolved dependency to run after the given delay.
		/// </summary>
		string Schedule<T>(Expression<Action<T>> job, TimeSpan delay);

		/// <summary>
		/// Schedule an async job with DI-resolved dependency to run after the given delay.
		/// </summary>
		string Schedule<T>(Expression<Func<T, Task>> job, TimeSpan delay);

		/// <summary>
		/// Register (or replace) a recurring job identified by <paramref name="jobId"/>.
		/// </summary>
		/// <param name="cronExpression">Standard cron expression, e.g. "0 2 * * *" for 2 AM daily.</param>
		void AddOrUpdateRecurring<T>(string jobId, Expression<Func<T, Task>> job, string cronExpression);

		/// <summary>
		/// Register (or replace) a sync recurring job.
		/// </summary>
		void AddOrUpdateRecurring<T>(string jobId, Expression<Action<T>> job, string cronExpression);

		/// <summary>
		/// Remove a recurring job by its id.
		/// </summary>
		void RemoveRecurringIfExists(string jobId);

		/// <summary>
		/// Delete a scheduled/enqueued job by its id. Returns true if deletion succeeded.
		/// </summary>
		bool Delete(string jobId);

		/// <summary>
		/// Chain a continuation job that runs after the parent job completes successfully.
		/// </summary>
		string ContinueWith<T>(string parentJobId, Expression<Func<T, Task>> job);
	}
}
