using Hangfire;
using Lawyer.Application.Dtos.AiJobs;
using Lawyer.Application.IServices;
using Lawyer.Application.Common.Interface;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Net;

namespace Lawyer.Application.Services
{
    public class AiJobService : IAiJobService
    {
        private const string UserCancelledMessage = "تم إلغاء التحليل بواسطة المستخدم";
        private readonly IApplicationDbContext _db;
        private readonly IBackgroundJobClient _hangfire;
        private readonly IAiJobNotificationService _notifications;
        private readonly ICaseAccessValidator _caseAccessValidator;

        public AiJobService(
            IApplicationDbContext db,
            IBackgroundJobClient hangfire,
            IAiJobNotificationService notifications,
            ICaseAccessValidator caseAccessValidator)
        {
            _db = db;
            _hangfire = hangfire;
            _notifications = notifications;
            _caseAccessValidator = caseAccessValidator;
        }

        public async Task<Result<List<AiJobStatusDto>>> GetAllByCaseAsync(Guid caseId, string userId, CancellationToken ct)
        {
            var accessResult = await ValidateCaseAccessAsync(caseId, userId, ct);
            if (!accessResult.Succeeded)
                return Result<List<AiJobStatusDto>>.Error(accessResult.StatusCode, accessResult.Message);

            var jobs = await _db.AiJobs
                .AsNoTracking()
                .Where(j => j.CaseId == caseId)
                .OrderBy(j => j.StepType)
                .ThenBy(j => j.CreatedAt)
                .Select(j => ToDto(j))
                .ToListAsync(ct);
            return Result<List<AiJobStatusDto>>.Success(jobs);
        }

        public async Task<Result<AiJobStatusDto>> GetByCaseAndStepAsync(Guid caseId, AiStepType step, string userId, CancellationToken ct)
        {
            var accessResult = await ValidateCaseAccessAsync(caseId, userId, ct);
            if (!accessResult.Succeeded)
                return Result<AiJobStatusDto>.Error(accessResult.StatusCode, accessResult.Message);

            var job = await _db.AiJobs
                .AsNoTracking()
                .Where(j => j.CaseId == caseId && j.StepType == step)
                .OrderByDescending(j => j.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (job == null)
                return Result<AiJobStatusDto>.Error(HttpStatusCode.NotFound, "No job found for this case and step.");

            return Result<AiJobStatusDto>.Success(ToDto(job));
        }

        public async Task<Result<AiJobStatusDto>> SubmitAsync(Guid caseId, SubmitAiJobDto dto, string userId, CancellationToken ct)
        {
            var accessResult = await ValidateCaseAccessAsync(caseId, userId, ct);
            if (!accessResult.Succeeded)
                return Result<AiJobStatusDto>.Error(accessResult.StatusCode, accessResult.Message);

            var dbContext = (DbContext)_db;

            try
            {
                await using var transaction = await dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

                var activeJob = await GetActiveJobAsync(caseId, dto.StepType, ct);
                if (activeJob != null)
                {
                    await transaction.CommitAsync(ct);
                    return Result<AiJobStatusDto>.Success(ToDto(activeJob), HttpStatusCode.OK.ToString());
                }

                var latestJob = await GetLatestJobAsync(caseId, dto.StepType, ct);
                var job = latestJob is null
                    ? CreateQueuedJob(caseId, dto.StepType)
                    : ResetForResubmission(latestJob);

                if (latestJob is null)
                    _db.AiJobs.Add(job);

                await _db.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);

                await EnqueueJobAsync(job, dto.InputJson, ct);
                return Result<AiJobStatusDto>.Success(ToDto(job));
            }
            catch (DbUpdateException ex) when (IsDuplicateActiveJobViolation(ex))
            {
                dbContext.ChangeTracker.Clear();
                var existing = await GetActiveJobAsync(caseId, dto.StepType, ct);
                if (existing != null)
                    return Result<AiJobStatusDto>.Success(ToDto(existing), HttpStatusCode.OK.ToString());

                throw;
            }
        }

        public async Task<Result<AiJobStatusDto>> RetryAsync(Guid caseId, AiStepType step, SubmitAiJobDto dto, string userId, CancellationToken ct)
        {
            var accessResult = await ValidateCaseAccessAsync(caseId, userId, ct);
            if (!accessResult.Succeeded)
                return Result<AiJobStatusDto>.Error(accessResult.StatusCode, accessResult.Message);

            var existing = await _db.AiJobs
                .AsNoTracking()
                .Where(j => j.CaseId == caseId && j.StepType == step && j.Status == AiJobStatus.Failed)
                .OrderByDescending(j => j.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (existing == null)
                return Result<AiJobStatusDto>.Error(HttpStatusCode.Conflict,
                    "Job is not in a failed state. Only failed jobs can be retried.");

            return await SubmitAsync(caseId, dto, userId, ct);
        }

        public async Task<Result<AiJobStatusDto>> CancelAsync(Guid caseId, AiStepType step, string userId, CancellationToken ct)
        {
            var accessResult = await ValidateCaseAccessAsync(caseId, userId, ct);
            if (!accessResult.Succeeded)
                return Result<AiJobStatusDto>.Error(accessResult.StatusCode, accessResult.Message);

            var job = await GetActiveJobAsync(caseId, step, ct);
            if (job == null)
            {
                return Result<AiJobStatusDto>.Error(HttpStatusCode.Conflict,
                    "لا يوجد تحليل جارٍ يمكن إلغاؤه لهذه الخطوة.");
            }

            if (!string.IsNullOrWhiteSpace(job.HangfireJobId))
            {
                BackgroundJob.Delete(job.HangfireJobId);
            }

            job.Status = AiJobStatus.Failed;
            job.ErrorMessage = UserCancelledMessage;
            job.CompletedAt = DateTime.UtcNow;
            job.HangfireJobId = null;
            await _db.SaveChangesAsync(ct);
            await _notifications.NotifyJobFailedAsync(job);

            return Result<AiJobStatusDto>.Success(ToDto(job), "تم إلغاء التحليل بنجاح");
        }

        private static AiJobStatusDto ToDto(AiJob j) => new(
            j.Id, j.CaseId, j.StepType, j.Status,
            j.ResultJson, j.ErrorMessage, j.CreatedAt, j.CompletedAt);

        private async Task<AiJob?> GetActiveJobAsync(Guid caseId, AiStepType stepType, CancellationToken ct)
        {
            return await _db.AiJobs
                .Where(j => j.CaseId == caseId && j.StepType == stepType
                            && (j.Status == AiJobStatus.Queued || j.Status == AiJobStatus.Processing))
                .OrderByDescending(j => j.CreatedAt)
                .FirstOrDefaultAsync(ct);
        }

        private async Task<AiJob?> GetLatestJobAsync(Guid caseId, AiStepType stepType, CancellationToken ct)
        {
            return await _db.AiJobs
                .Where(j => j.CaseId == caseId && j.StepType == stepType)
                .OrderByDescending(j => j.CreatedAt)
                .FirstOrDefaultAsync(ct);
        }

        private static AiJob CreateQueuedJob(Guid caseId, AiStepType stepType)
        {
            return new AiJob
            {
                CaseId = caseId,
                StepType = stepType,
                Status = AiJobStatus.Queued,
            };
        }

        private static AiJob ResetForResubmission(AiJob job)
        {
            job.Status = AiJobStatus.Queued;
            job.ErrorMessage = null;
            job.ResultJson = null;
            job.CompletedAt = null;
            job.StartedAt = null;
            job.HangfireJobId = null;
            job.CreatedAt = DateTime.UtcNow;
            return job;
        }

        private async Task EnqueueJobAsync(AiJob job, string inputJson, CancellationToken ct)
        {
            var hangfireId = _hangfire.Enqueue<AiJobWorker>(
                worker => worker.ProcessAsync(job.Id, inputJson, null));

            job.HangfireJobId = hangfireId;
            await _db.SaveChangesAsync(ct);
        }

        private static bool IsDuplicateActiveJobViolation(DbUpdateException ex)
        {
            var sqlErrorNumber = ex.InnerException?.GetType().GetProperty("Number")?.GetValue(ex.InnerException);
            return sqlErrorNumber is int errorNumber && (errorNumber == 2601 || errorNumber == 2627);
        }

        private async Task<Result<bool>> ValidateCaseAccessAsync(Guid caseId, string userId, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return Result<bool>.Error(HttpStatusCode.Unauthorized, "User not authenticated.");

            return await _caseAccessValidator.ValidateAsync(caseId, userId, false, ct);
        }
    }
}
