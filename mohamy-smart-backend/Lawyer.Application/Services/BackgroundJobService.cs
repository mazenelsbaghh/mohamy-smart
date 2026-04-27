using System.Linq.Expressions;
using Hangfire;
using Lawyer.Application.IServices;
using Microsoft.Extensions.Logging;

namespace Lawyer.Application.Services
{
	/// <summary>
	/// Hangfire-backed implementation of <see cref="IBackgroundJobService"/>.
	/// All calls are thin wrappers; Hangfire handles persistence, retries, and worker execution.
	/// </summary>
	public sealed class BackgroundJobService : IBackgroundJobService
	{
		private readonly IBackgroundJobClient _client;
		private readonly IRecurringJobManager _recurring;
		private readonly ILogger<BackgroundJobService> _logger;

		public BackgroundJobService(
			IBackgroundJobClient client,
			IRecurringJobManager recurring,
			ILogger<BackgroundJobService> logger)
		{
			_client = client;
			_recurring = recurring;
			_logger = logger;
		}

		public string Enqueue(Expression<Action> job)
		{
			var id = _client.Enqueue(job);
			_logger.LogInformation("Enqueued background job {JobId}", id);
			return id;
		}

		public string Enqueue<T>(Expression<Action<T>> job)
		{
			var id = _client.Enqueue(job);
			_logger.LogInformation("Enqueued background job {JobId} (type {Type})", id, typeof(T).Name);
			return id;
		}

		public string Enqueue<T>(Expression<Func<T, Task>> job)
		{
			var id = _client.Enqueue(job);
			_logger.LogInformation("Enqueued async background job {JobId} (type {Type})", id, typeof(T).Name);
			return id;
		}

		public string Schedule(Expression<Action> job, TimeSpan delay)
		{
			var id = _client.Schedule(job, delay);
			_logger.LogInformation("Scheduled background job {JobId} in {Delay}", id, delay);
			return id;
		}

		public string Schedule<T>(Expression<Action<T>> job, TimeSpan delay)
		{
			var id = _client.Schedule(job, delay);
			_logger.LogInformation("Scheduled background job {JobId} in {Delay} (type {Type})", id, delay, typeof(T).Name);
			return id;
		}

		public string Schedule<T>(Expression<Func<T, Task>> job, TimeSpan delay)
		{
			var id = _client.Schedule(job, delay);
			_logger.LogInformation("Scheduled async background job {JobId} in {Delay} (type {Type})", id, delay, typeof(T).Name);
			return id;
		}

		public void AddOrUpdateRecurring<T>(string jobId, Expression<Func<T, Task>> job, string cronExpression)
		{
			_recurring.AddOrUpdate(jobId, job, cronExpression);
			_logger.LogInformation("Registered recurring job {JobId} with cron {Cron}", jobId, cronExpression);
		}

		public void AddOrUpdateRecurring<T>(string jobId, Expression<Action<T>> job, string cronExpression)
		{
			_recurring.AddOrUpdate(jobId, job, cronExpression);
			_logger.LogInformation("Registered recurring job {JobId} with cron {Cron}", jobId, cronExpression);
		}

		public void RemoveRecurringIfExists(string jobId)
		{
			_recurring.RemoveIfExists(jobId);
			_logger.LogInformation("Removed recurring job {JobId}", jobId);
		}

		public bool Delete(string jobId)
		{
			var deleted = _client.Delete(jobId);
			if (deleted)
				_logger.LogInformation("Deleted background job {JobId}", jobId);
			return deleted;
		}

		public string ContinueWith<T>(string parentJobId, Expression<Func<T, Task>> job)
		{
			var id = _client.ContinueJobWith(parentJobId, job);
			_logger.LogInformation("Chained continuation job {JobId} after parent {ParentId}", id, parentJobId);
			return id;
		}
	}
}
