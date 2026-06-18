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
        private readonly IAiPointAccountingService _points;

        public AiJobService(
            IApplicationDbContext db,
            IBackgroundJobClient hangfire,
            IAiJobNotificationService notifications,
            ICaseAccessValidator caseAccessValidator,
            IAiPointAccountingService points)
        {
            _db = db;
            _hangfire = hangfire;
            _notifications = notifications;
            _caseAccessValidator = caseAccessValidator;
            _points = points;
        }

        public AiJobService(
            IApplicationDbContext db,
            IBackgroundJobClient hangfire,
            IAiJobNotificationService notifications,
            ICaseAccessValidator caseAccessValidator)
            : this(db, hangfire, notifications, caseAccessValidator, new AiPointAccountingService(db))
        {
        }

        public async Task<Result<List<AiJobStatusDto>>> GetAllByCaseAsync(
            Guid caseId,
            string userId,
            string? runId,
            string? workflowType,
            DateTime? since,
            bool includeLegacyActive,
            CancellationToken ct)
        {
            var accessResult = await ValidateCaseAccessAsync(caseId, userId, ct);
            if (!accessResult.Succeeded)
                return Result<List<AiJobStatusDto>>.Error(accessResult.StatusCode, accessResult.Message);

            var query = _db.AiJobs
                .AsNoTracking()
                .Where(j => j.CaseId == caseId);

            if (!string.IsNullOrWhiteSpace(runId))
            {
                query = query.Where(j =>
                    j.RunId == runId ||
                    (includeLegacyActive &&
                     j.RunId == null &&
                     (j.Status == AiJobStatus.Queued || j.Status == AiJobStatus.Processing)));
            }

            if (!string.IsNullOrWhiteSpace(workflowType))
            {
                query = query.Where(j =>
                    j.WorkflowType == workflowType ||
                    (includeLegacyActive &&
                     j.WorkflowType == null &&
                     (j.Status == AiJobStatus.Queued || j.Status == AiJobStatus.Processing)));
            }

            if (since.HasValue)
            {
                var cutoff = DateTime.SpecifyKind(since.Value, DateTimeKind.Utc).AddSeconds(-10);
                query = query.Where(j => j.CreatedAt >= cutoff || j.Status == AiJobStatus.Queued || j.Status == AiJobStatus.Processing);
            }

            var jobs = await query
                .OrderByDescending(j => j.CreatedAt)
                .Take(100)
                .ToListAsync(ct);

            return Result<List<AiJobStatusDto>>.Success(jobs
                .OrderBy(j => j.StepType)
                .ThenBy(j => j.CreatedAt)
                .Select(ToDto)
                .ToList());
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
                    var activeJob = await GetActiveJobAsync(caseId, dto.StepType, dto.RunId, ct);
                    if (activeJob != null)
                    {
                        await transaction.CommitAsync(ct);
                        return Result<AiJobStatusDto>.Success(ToDto(activeJob), HttpStatusCode.OK.ToString());
                    }
                }

                var lawyerId = await GetLawyerIdForCaseAsync(caseId, ct);
                var repeatValidation = ValidateRepeatIntent(dto);
                if (!repeatValidation.Succeeded)
                    return Result<AiJobStatusDto>.Error(repeatValidation.StatusCode, repeatValidation.Message);

                var availability = await _points.ValidateCanStartAsync(lawyerId, dto.StepType, dto.RunId, dto.WorkflowType, ct);
                if (!availability.Succeeded)
                    return Result<AiJobStatusDto>.Error(availability.StatusCode, availability.Message);

                var latestJob = !string.IsNullOrEmpty(dto.RunId) && dto.StepNumber.HasValue
                    ? await GetLatestJobByRunAsync(caseId, dto.RunId, dto.WorkflowType, dto.StepNumber.Value, ct)
                    : await GetLatestJobAsync(caseId, dto.StepType, ct);
                var shouldCreateNewAttempt = latestJob is null || dto.RepeatIntent.HasValue || dto.StepType == AiStepType.AnalysisDefense;
                var job = shouldCreateNewAttempt
                    ? CreateQueuedJob(caseId, dto.StepType, dto.RunId, dto.WorkflowType, dto.StepNumber)
                    : ResetForResubmission(latestJob!, dto.RunId, dto.WorkflowType, dto.StepNumber);

                ApplyPointMetadata(job, dto);

                if (shouldCreateNewAttempt)
                    _db.AiJobs.Add(job);

                await _db.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);

                await EnqueueJobAsync(job, dto.InputJson ?? "{}", ct);
                return Result<AiJobStatusDto>.Success(ToDto(job));
            }
            catch (DbUpdateException ex) when (IsDuplicateActiveJobViolation(ex))
            {
                dbContext.ChangeTracker.Clear();
                var existing = !string.IsNullOrEmpty(dto.RunId) && dto.StepNumber.HasValue
                    ? await GetActiveJobEntityByRunAsync(caseId, dto.RunId, dto.WorkflowType, dto.StepNumber.Value, ct)
                    : await GetActiveJobAsync(caseId, dto.StepType, dto.RunId, ct);
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

            var job = await GetActiveJobAsync(caseId, step, null, ct);
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
            var lawyerId = await GetLawyerIdForCaseAsync(caseId, ct);
            await _points.MarkNoChargeAsync(job, lawyerId, AiPointReasonCode.Cancelled, "لم يتم خصم أي نقاط لأن الطلب تم إلغاؤه.", ct);
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

            job.Status = AiJobStatus.Failed;
            job.ErrorCode = "StaleIgnored";
            job.ErrorMessage = "تم تجاهل نتيجة قديمة لأنها لا تخص نسخة سير العمل الحالية.";
            job.CompletedAt = DateTime.UtcNow;
            job.HangfireJobId = null;
            var lawyerId = await GetLawyerIdForCaseAsync(job.CaseId, ct);
            await _points.MarkNoChargeAsync(job, lawyerId, AiPointReasonCode.StaleIgnored, "لم يتم خصم أي نقاط لأن نتيجة الطلب أصبحت قديمة.", ct);
            await _db.SaveChangesAsync(ct);
            await _notifications.NotifyJobFailedAsync(job);

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
            await _notifications.NotifyJobFailedAsync(job);

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
                var lawyerId = await GetLawyerIdForCaseAsync(job.CaseId, ct);
                await _points.MarkNoChargeAsync(job, lawyerId, AiPointReasonCode.Timeout, "لم يتم خصم أي نقاط لأن الطلب انتهت مهلته قبل اكتماله.", ct);
            }

            await _db.SaveChangesAsync(ct);

            foreach (var job in stuckJobs)
            {
                await _notifications.NotifyJobFailedAsync(job);
            }
        }

        private AiJobStatusDto ToDto(AiJob j) => new(
            j.Id, j.CaseId, j.StepType, j.Status,
            j.ResultJson, j.ErrorMessage, j.CreatedAt, j.CompletedAt,
            j.RunId, j.WorkflowType, j.StepNumber, j.ErrorCode, null,
            _points.BuildChargeMetadata(j));

        private async Task<AiJob?> GetActiveJobAsync(Guid caseId, AiStepType stepType, string? runId, CancellationToken ct)
        {
            if (stepType == AiStepType.AnalysisDefense && !string.IsNullOrEmpty(runId))
            {
                return await _db.AiJobs
                    .Where(j => j.CaseId == caseId && j.StepType == stepType && j.RunId == runId
                                && (j.Status == AiJobStatus.Queued || j.Status == AiJobStatus.Processing))
                    .OrderByDescending(j => j.CreatedAt)
                    .FirstOrDefaultAsync(ct);
            }

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

        private void ApplyPointMetadata(AiJob job, SubmitAiJobDto dto)
        {
            job.PointCost = _points.ResolvePointCost(dto.StepType);
            job.ChargeState = AiChargeState.Pending;
            job.ChargedPoints = 0;
            job.ChargeReason = null;
            job.ChargedAt = null;
            job.IsRepeatAttempt = dto.RepeatIntent.HasValue;
            job.RepeatIntent = dto.RepeatIntent;
            job.ConfirmationAcceptedAt = dto.ConfirmationAcceptedAt;
        }

        private static Result<bool> ValidateRepeatIntent(SubmitAiJobDto dto)
        {
            if (dto.RepeatIntent.HasValue && dto.ConfirmationAcceptedAt == null)
            {
                return Result<bool>.Error(
                    HttpStatusCode.BadRequest,
                    "يجب تأكيد إعادة المحاولة قبل إرسال طلب جديد يستهلك نقاطًا.");
            }

            return Result<bool>.Success(result: true);
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

        private async Task<Guid> GetLawyerIdForCaseAsync(Guid caseId, CancellationToken ct)
        {
            var lawyerId = await _db.Cases
                .Where(c => c.Id == caseId)
                .Select(c => c.LawyerId)
                .FirstOrDefaultAsync(ct);

            if (lawyerId == Guid.Empty)
                throw new InvalidOperationException("Case not found.");

            return lawyerId;
        }
    }
}
