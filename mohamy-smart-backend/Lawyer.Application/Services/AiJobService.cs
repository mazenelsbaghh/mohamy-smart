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

                if (!string.IsNullOrEmpty(dto.RunId) && dto.StepNumber.HasValue)
                {
                    var runJobResult = await GetActiveJobByRunAsync(caseId, dto.RunId, dto.WorkflowType!, dto.StepNumber.Value, userId, ct);
                    if (runJobResult.Succeeded && runJobResult.Data != null)
                    {
                        await transaction.CommitAsync(ct);
                        return Result<AiJobStatusDto>.Success(runJobResult.Data, HttpStatusCode.OK.ToString());
                    }
                }
                else
                {
                    var activeJob = await GetActiveJobAsync(caseId, dto.StepType, ct);
                    if (activeJob != null)
                    {
                        await transaction.CommitAsync(ct);
                        return Result<AiJobStatusDto>.Success(ToDto(activeJob), HttpStatusCode.OK.ToString());
                    }
                }

                var latestJob = !string.IsNullOrEmpty(dto.RunId) && dto.StepNumber.HasValue
                    ? await GetLatestJobByRunAsync(caseId, dto.RunId, dto.WorkflowType, dto.StepNumber.Value, ct)
                    : await GetLatestJobAsync(caseId, dto.StepType, ct);
                var job = latestJob is null
                    ? CreateQueuedJob(caseId, dto.StepType, dto.RunId, dto.WorkflowType, dto.StepNumber)
                    : ResetForResubmission(latestJob, dto.RunId, dto.WorkflowType, dto.StepNumber);

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
                var existing = !string.IsNullOrEmpty(dto.RunId) && dto.StepNumber.HasValue
                    ? await GetActiveJobEntityByRunAsync(caseId, dto.RunId, dto.WorkflowType, dto.StepNumber.Value, ct)
                    : await GetActiveJobAsync(caseId, dto.StepType, ct);
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

        public async Task<Result<AiJobStatusDto?>> GetActiveJobByRunAsync(Guid caseId, string runId, string workflowType, int stepNumber, string userId, CancellationToken ct)
        {
            var accessResult = await ValidateCaseAccessAsync(caseId, userId, ct);
            if (!accessResult.Succeeded)
                return Result<AiJobStatusDto?>.Error(accessResult.StatusCode, accessResult.Message);

            var job = await _db.AiJobs
                .AsNoTracking()
                .Where(j => j.CaseId == caseId && j.RunId == runId && j.WorkflowType == workflowType && j.StepNumber == stepNumber
                            && (j.Status == AiJobStatus.Queued || j.Status == AiJobStatus.Processing))
                .OrderByDescending(j => j.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (job == null)
                return Result<AiJobStatusDto?>.Success(null);

            return Result<AiJobStatusDto?>.Success(ToDto(job));
        }

        public async Task<Result<bool>> IgnoreStaleCompletionAsync(Guid jobId, string activeRunId, string userId, CancellationToken ct)
        {
            var job = await _db.AiJobs.FindAsync(new object[] { jobId }, ct);
            if (job == null)
                return Result<bool>.Error(HttpStatusCode.NotFound, "Job not found.");

            var accessResult = await ValidateCaseAccessAsync(job.CaseId, userId, ct);
            if (!accessResult.Succeeded)
                return Result<bool>.Error(accessResult.StatusCode, accessResult.Message);

            if (job.RunId == activeRunId)
                return Result<bool>.Success(data: false);

            job.Status = AiJobStatus.Completed;
            job.CompletedAt = DateTime.UtcNow;
            job.HangfireJobId = null;
            await _db.SaveChangesAsync(ct);

            return Result<bool>.Success(data: true);
        }

        public async Task<Result<AiJobStatusDto>> MarkConflictAsync(Guid jobId, string errorCode, string conflictMessage, string userId, CancellationToken ct)
        {
            var job = await _db.AiJobs.FindAsync(new object[] { jobId }, ct);
            if (job == null)
                return Result<AiJobStatusDto>.Error(HttpStatusCode.NotFound, "Job not found.");

            var accessResult = await ValidateCaseAccessAsync(job.CaseId, userId, ct);
            if (!accessResult.Succeeded)
                return Result<AiJobStatusDto>.Error(accessResult.StatusCode, accessResult.Message);

            job.Status = AiJobStatus.Conflict;
            job.ErrorCode = errorCode;
            job.ErrorMessage = conflictMessage;
            job.CompletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            return Result<AiJobStatusDto>.Success(ToDto(job));
        }

        public async Task CleanupStuckJobsAsync(CancellationToken ct)
        {
            var cutoffTime = DateTime.UtcNow.AddHours(-1);

            var stuckJobs = await _db.AiJobs
                .Where(j => (j.Status == AiJobStatus.Processing || j.Status == AiJobStatus.Queued)
                            && j.CreatedAt < cutoffTime)
                .ToListAsync(ct);

            if (!stuckJobs.Any())
                return;

            foreach (var job in stuckJobs)
            {
                job.Status = AiJobStatus.Failed;
                job.ErrorMessage = "Job auto-cancelled due to stuck processing state (timeout).";
                job.ErrorCode = "Timeout";
                job.CompletedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync(ct);
        }

        private static AiJobStatusDto ToDto(AiJob j) => new(
            j.Id, j.CaseId, j.StepType, j.Status,
            j.ResultJson, j.ErrorMessage, j.CreatedAt, j.CompletedAt,
            j.RunId, j.WorkflowType, j.StepNumber, j.ErrorCode, null);

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

        private async Task<AiJob?> GetLatestJobByRunAsync(Guid caseId, string runId, string? workflowType, int stepNumber, CancellationToken ct)
        {
            return await _db.AiJobs
                .Where(j => j.CaseId == caseId && j.RunId == runId && j.WorkflowType == workflowType && j.StepNumber == stepNumber)
                .OrderByDescending(j => j.CreatedAt)
                .FirstOrDefaultAsync(ct);
        }

        private async Task<AiJob?> GetActiveJobEntityByRunAsync(Guid caseId, string runId, string? workflowType, int stepNumber, CancellationToken ct)
        {
            return await _db.AiJobs
                .Where(j => j.CaseId == caseId && j.RunId == runId && j.WorkflowType == workflowType && j.StepNumber == stepNumber
                            && (j.Status == AiJobStatus.Queued || j.Status == AiJobStatus.Processing))
                .OrderByDescending(j => j.CreatedAt)
                .FirstOrDefaultAsync(ct);
        }

        private static AiJob CreateQueuedJob(Guid caseId, AiStepType stepType, string? runId, string? workflowType, int? stepNumber)
        {
            return new AiJob
            {
                CaseId = caseId,
                StepType = stepType,
                Status = AiJobStatus.Queued,
                RunId = runId,
                WorkflowType = workflowType,
                StepNumber = stepNumber,
            };
        }

        private static AiJob ResetForResubmission(AiJob job, string? runId, string? workflowType, int? stepNumber)
        {
            job.Status = AiJobStatus.Queued;
            job.ErrorMessage = null;
            job.ErrorCode = null;
            job.ResultJson = null;
            job.CompletedAt = null;
            job.StartedAt = null;
            job.HangfireJobId = null;
            job.RunId = runId;
            job.WorkflowType = workflowType;
            job.StepNumber = stepNumber;
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
