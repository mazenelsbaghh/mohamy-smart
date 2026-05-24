using Lawyer.Application.Common.Interface;
using Lawyer.Application.Dtos.AiPoints;
using Lawyer.Application.IServices;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System.Net;

namespace Lawyer.Application.Services
{
    public class AiPointAccountingService : IAiPointAccountingService
    {
        private readonly IApplicationDbContext _db;
        private readonly ILogger<AiPointAccountingService> _logger;

        public AiPointAccountingService(IApplicationDbContext db, ILogger<AiPointAccountingService>? logger = null)
        {
            _db = db;
            _logger = logger ?? NullLogger<AiPointAccountingService>.Instance;
        }

        public int ResolvePointCost(AiStepType stepType)
        {
            return stepType switch
            {
                AiStepType.Ocr => 1,
                _ => 1
            };
        }

        public async Task<Result<AiPointBalanceDto>> GetCurrentBalanceAsync(Guid lawyerId, CancellationToken ct)
        {
            var subscription = await GetActiveSubscriptionAsync(lawyerId, ct);
            if (subscription == null)
            {
                return Result<AiPointBalanceDto>.Error(
                    HttpStatusCode.BadRequest,
                    "لا يوجد اشتراك نشط لاستخدام ميزات الذكاء الاصطناعي.");
            }

            if (subscription.EndDate < DateTime.UtcNow)
            {
                subscription.IsActive = false;
                await _db.SaveChangesAsync(ct);
                return Result<AiPointBalanceDto>.Error(
                    HttpStatusCode.BadRequest,
                    "انتهى الاشتراك الحالي. يرجى تجديد الاشتراك لاستخدام ميزات الذكاء الاصطناعي.");
            }

            await SyncUsedRequestsFromTransactionsAsync(subscription, ct);

            return Result<AiPointBalanceDto>.Success(ToBalance(subscription));
        }

        public async Task<Result<AiPointBalanceDto>> ValidateCanStartAsync(
            Guid lawyerId,
            AiStepType stepType,
            string? runId,
            string? workflowType,
            CancellationToken ct)
        {
            var cost = ResolvePointCost(stepType);

            if (!string.IsNullOrEmpty(runId))
            {
                var alreadyCharged = await _db.AiPointTransactions
                    .AsNoTracking()
                    .AnyAsync(t => t.WorkflowRunId == runId && t.TransactionType == AiPointTransactionType.Charge, ct);
                if (alreadyCharged)
                {
                    cost = 0;
                }
            }

            var balanceResult = await GetCurrentBalanceAsync(lawyerId, ct);
            if (!balanceResult.Succeeded || balanceResult.Data == null)
            {
                return balanceResult;
            }

            if (cost > 0 && balanceResult.Data.Available < cost)
            {
                return Result<AiPointBalanceDto>.Error(
                    HttpStatusCode.PaymentRequired,
                    "رصيد النقاط غير كافٍ لتشغيل هذا الطلب.");
            }

            return balanceResult;
        }

        public async Task<Result<AiPointBalanceDto>> ChargeSuccessfulDirectActionAsync(
            Guid lawyerId,
            AiStepType stepType,
            int pointCost,
            Guid? caseId,
            string? workflowType,
            string? workflowRunId,
            string messageAr,
            CancellationToken ct)
        {
            var subscription = await GetActiveSubscriptionAsync(lawyerId, ct);
            if (subscription == null)
            {
                return Result<AiPointBalanceDto>.Error(
                    HttpStatusCode.BadRequest,
                    "لا يوجد اشتراك نشط لاستخدام ميزات الذكاء الاصطناعي.");
            }

            if (subscription.EndDate < DateTime.UtcNow)
            {
                subscription.IsActive = false;
                await _db.SaveChangesAsync(ct);
                return Result<AiPointBalanceDto>.Error(
                    HttpStatusCode.BadRequest,
                    "انتهى الاشتراك الحالي. يرجى تجديد الاشتراك لاستخدام ميزات الذكاء الاصطناعي.");
            }

            if (pointCost <= 0)
            {
                return Result<AiPointBalanceDto>.Success(ToBalance(subscription));
            }

            var limit = subscription.Subscription.AiRequestsLimit ?? 0;
            if (subscription.UsedAiRequests + pointCost > limit)
            {
                return Result<AiPointBalanceDto>.Error(
                    HttpStatusCode.PaymentRequired,
                    "رصيد النقاط غير كافٍ لتشغيل هذا الطلب.");
            }

            var before = subscription.UsedAiRequests;
            subscription.UsedAiRequests += pointCost;

            _db.AiPointTransactions.Add(new AiPointTransaction
            {
                LawyerId = lawyerId,
                LawyerSubscriptionId = subscription.Id,
                AiJobId = null,
                CaseId = caseId,
                WorkflowType = workflowType,
                WorkflowRunId = workflowRunId,
                StepType = stepType,
                TransactionType = AiPointTransactionType.Charge,
                Points = pointCost,
                BalanceBefore = before,
                BalanceAfter = subscription.UsedAiRequests,
                ReasonCode = AiPointReasonCode.Success,
                MessageAr = messageAr
            });

            await _db.SaveChangesAsync(ct);
            LogPointDeduction(lawyerId, subscription.Id, null, caseId, workflowType, workflowRunId, stepType, pointCost, before, subscription.UsedAiRequests, messageAr);

            return Result<AiPointBalanceDto>.Success(ToBalance(subscription));
        }

        public async Task<Result<AiChargeMetadataDto>> ChargeSuccessfulJobAsync(AiJob job, Guid lawyerId, CancellationToken ct)
        {
            if (job.PointCost <= 0)
            {
                job.ChargeState = AiChargeState.NoCharge;
                job.ChargedPoints = 0;
                job.ChargeReason = "هذا الطلب لا يستهلك نقاطًا.";
                await _db.SaveChangesAsync(ct);
                return Result<AiChargeMetadataDto>.Success(BuildChargeMetadata(job));
            }

            if (job.ChargeState == AiChargeState.Charged)
            {
                return Result<AiChargeMetadataDto>.Success(BuildChargeMetadata(job));
            }

            if (!string.IsNullOrEmpty(job.RunId))
            {
                var runAlreadyCharged = await _db.AiPointTransactions
                    .AsNoTracking()
                    .AnyAsync(t => t.WorkflowRunId == job.RunId && t.TransactionType == AiPointTransactionType.Charge, ct);
                if (runAlreadyCharged)
                {
                    job.ChargeState = AiChargeState.NoCharge;
                    job.ChargedPoints = 0;
                    job.ChargeReason = "لم يتم خصم نقاط إضافية لهذا الطلب لأنه جزء من مرحلة عمل تم خصم نقاطها بالفعل.";

                    var activeSub = await GetActiveSubscriptionAsync(lawyerId, ct);
                    if (activeSub != null)
                    {
                        await AddTransactionAsync(activeSub, job, AiPointTransactionType.NoCharge, 0, AiPointReasonCode.Success, job.ChargeReason, ct);
                    }
                    await _db.SaveChangesAsync(ct);
                    return Result<AiChargeMetadataDto>.Success(BuildChargeMetadata(job, activeSub == null ? null : ToBalance(activeSub)));
                }
            }

            var existingCharge = await _db.AiPointTransactions
                .AsNoTracking()
                .AnyAsync(t => t.AiJobId == job.Id && t.TransactionType == AiPointTransactionType.Charge, ct);
            if (existingCharge)
            {
                job.ChargeState = AiChargeState.Charged;
                job.ChargedPoints = job.PointCost;
                job.ChargedAt ??= DateTime.UtcNow;
                job.ChargeReason ??= $"تم خصم {FormatPoints(job.PointCost)} بعد اكتمال الطلب بنجاح.";
                await _db.SaveChangesAsync(ct);
                return Result<AiChargeMetadataDto>.Success(BuildChargeMetadata(job));
            }

            var subscription = await GetActiveSubscriptionAsync(lawyerId, ct);
            if (subscription == null || subscription.EndDate < DateTime.UtcNow)
            {
                job.ChargeState = AiChargeState.NoCharge;
                job.ChargedPoints = 0;
                job.ChargeReason = "لم يتم خصم أي نقاط لأن الاشتراك غير نشط وقت اكتمال الطلب.";
                await _db.SaveChangesAsync(ct);
                return Result<AiChargeMetadataDto>.Error(HttpStatusCode.Conflict, job.ChargeReason);
            }

            var limit = subscription.Subscription.AiRequestsLimit ?? 0;
            if (subscription.UsedAiRequests + job.PointCost > limit)
            {
                job.ChargeState = AiChargeState.NoCharge;
                job.ChargedPoints = 0;
                job.ChargeReason = "لم يتم خصم أي نقاط لأن رصيد الاشتراك غير كافٍ وقت اكتمال الطلب.";
                await _db.SaveChangesAsync(ct);
                return Result<AiChargeMetadataDto>.Error(HttpStatusCode.PaymentRequired, job.ChargeReason);
            }

            var before = subscription.UsedAiRequests;
            subscription.UsedAiRequests += job.PointCost;
            job.ChargeState = AiChargeState.Charged;
            job.ChargedPoints = job.PointCost;
            job.ChargedAt = DateTime.UtcNow;
            job.ChargeReason = $"تم خصم {FormatPoints(job.PointCost)} بعد اكتمال الطلب بنجاح.";

            _db.AiPointTransactions.Add(new AiPointTransaction
            {
                LawyerId = lawyerId,
                LawyerSubscriptionId = subscription.Id,
                AiJobId = job.Id,
                CaseId = job.CaseId,
                WorkflowType = job.WorkflowType,
                WorkflowRunId = job.RunId,
                StepType = job.StepType,
                TransactionType = AiPointTransactionType.Charge,
                Points = job.PointCost,
                BalanceBefore = before,
                BalanceAfter = subscription.UsedAiRequests,
                ReasonCode = AiPointReasonCode.Success,
                MessageAr = job.ChargeReason
            });

            await _db.SaveChangesAsync(ct);
            LogPointDeduction(lawyerId, subscription.Id, job.Id, job.CaseId, job.WorkflowType, job.RunId, job.StepType, job.PointCost, before, subscription.UsedAiRequests, job.ChargeReason);
            return Result<AiChargeMetadataDto>.Success(BuildChargeMetadata(job, ToBalance(subscription)));
        }

        public async Task<Result<AiChargeMetadataDto>> MarkNoChargeAsync(AiJob job, Guid lawyerId, AiPointReasonCode reasonCode, string messageAr, CancellationToken ct)
        {
            if (job.ChargeState == AiChargeState.Charged)
            {
                return Result<AiChargeMetadataDto>.Success(BuildChargeMetadata(job));
            }

            job.ChargeState = AiChargeState.NoCharge;
            job.ChargedPoints = 0;
            job.ChargeReason = messageAr;

            var subscription = await GetActiveSubscriptionAsync(lawyerId, ct);
            if (subscription != null)
            {
                await AddTransactionAsync(subscription, job, AiPointTransactionType.NoCharge, 0, reasonCode, messageAr, ct);
            }

            await _db.SaveChangesAsync(ct);
            return Result<AiChargeMetadataDto>.Success(BuildChargeMetadata(job, subscription == null ? null : ToBalance(subscription)));
        }

        public async Task<Result<AiChargeMetadataDto>> RestoreHoldAsync(AiJob job, Guid lawyerId, AiPointReasonCode reasonCode, string messageAr, CancellationToken ct)
        {
            job.ChargeState = AiChargeState.Restored;
            job.ChargedPoints = 0;
            job.ChargeReason = messageAr;

            var subscription = await GetActiveSubscriptionAsync(lawyerId, ct);
            if (subscription != null)
            {
                await AddTransactionAsync(subscription, job, AiPointTransactionType.Restore, job.PointCost, reasonCode, messageAr, ct);
            }

            await _db.SaveChangesAsync(ct);
            return Result<AiChargeMetadataDto>.Success(BuildChargeMetadata(job, subscription == null ? null : ToBalance(subscription)));
        }

        public AiChargeMetadataDto BuildChargeMetadata(AiJob job, AiPointBalanceDto? balance = null)
        {
            return new AiChargeMetadataDto(
                job.PointCost,
                job.ChargeState,
                job.ChargedPoints,
                job.ChargeReason,
                job.ChargedAt,
                job.IsRepeatAttempt,
                job.RepeatIntent,
                job.IsRepeatAttempt && job.ConfirmationAcceptedAt == null,
                balance
            );
        }

        public async Task<Result<List<AiPointTransactionDto>>> GetHistoryAsync(
            Guid lawyerId,
            DateTime? from,
            DateTime? to,
            Guid? caseId,
            string? workflowType,
            AiPointTransactionType? transactionType,
            CancellationToken ct)
        {
            var query = _db.AiPointTransactions
                .AsNoTracking()
                .Where(t => t.LawyerId == lawyerId);

            if (from.HasValue) query = query.Where(t => t.CreatedAt >= from.Value);
            if (to.HasValue) query = query.Where(t => t.CreatedAt <= to.Value);
            if (caseId.HasValue) query = query.Where(t => t.CaseId == caseId.Value);
            if (!string.IsNullOrWhiteSpace(workflowType)) query = query.Where(t => t.WorkflowType == workflowType);
            if (transactionType.HasValue) query = query.Where(t => t.TransactionType == transactionType.Value);

            var items = await query
                .OrderByDescending(t => t.CreatedAt)
                .Take(100)
                .Select(t => new AiPointTransactionDto(
                    t.Id,
                    t.CreatedAt,
                    t.CaseId,
                    t.WorkflowType,
                    t.WorkflowRunId,
                    t.StepType,
                    t.TransactionType,
                    t.Points,
                    t.BalanceBefore,
                    t.BalanceAfter,
                    t.ReasonCode,
                    t.MessageAr))
                .ToListAsync(ct);

            return Result<List<AiPointTransactionDto>>.Success(items);
        }

        private async Task<LawyerSubscription?> GetActiveSubscriptionAsync(Guid lawyerId, CancellationToken ct)
        {
            return await _db.LawyerSubscriptions
                .Include(s => s.Subscription)
                .Where(s => s.LawyerId == lawyerId && s.IsActive)
                .OrderByDescending(s => s.StartDate)
                .FirstOrDefaultAsync(ct);
        }

        private async Task AddTransactionAsync(
            LawyerSubscription subscription,
            AiJob job,
            AiPointTransactionType transactionType,
            int points,
            AiPointReasonCode reasonCode,
            string messageAr,
            CancellationToken ct)
        {
            var exists = await _db.AiPointTransactions
                .AnyAsync(t => t.AiJobId == job.Id && t.TransactionType == transactionType && t.ReasonCode == reasonCode, ct);
            if (exists) return;

            _db.AiPointTransactions.Add(new AiPointTransaction
            {
                LawyerId = subscription.LawyerId,
                LawyerSubscriptionId = subscription.Id,
                AiJobId = job.Id,
                CaseId = job.CaseId,
                WorkflowType = job.WorkflowType,
                WorkflowRunId = job.RunId,
                StepType = job.StepType,
                TransactionType = transactionType,
                Points = points,
                BalanceBefore = subscription.UsedAiRequests,
                BalanceAfter = subscription.UsedAiRequests,
                ReasonCode = reasonCode,
                MessageAr = messageAr
            });
        }

        private async Task SyncUsedRequestsFromTransactionsAsync(LawyerSubscription subscription, CancellationToken ct)
        {
            var transactions = await _db.AiPointTransactions
                .AsNoTracking()
                .Where(t => t.LawyerSubscriptionId == subscription.Id)
                .GroupBy(t => t.TransactionType)
                .Select(g => new { Type = g.Key, Points = g.Sum(t => t.Points) })
                .ToListAsync(ct);

            if (transactions.Count == 0)
            {
                return;
            }

            var charged = transactions.FirstOrDefault(t => t.Type == AiPointTransactionType.Charge)?.Points ?? 0;
            var restored = transactions.FirstOrDefault(t => t.Type == AiPointTransactionType.Restore)?.Points ?? 0;
            var syncedUsed = Math.Max(0, charged - restored);

            if (subscription.UsedAiRequests == syncedUsed)
            {
                return;
            }

            subscription.UsedAiRequests = syncedUsed;
            await _db.SaveChangesAsync(ct);
        }

        private static AiPointBalanceDto ToBalance(LawyerSubscription subscription)
        {
            var limit = subscription.Subscription.AiRequestsLimit ?? 0;
            var available = Math.Max(0, limit - subscription.UsedAiRequests);
            return new AiPointBalanceDto(
                limit,
                subscription.UsedAiRequests,
                0,
                available,
                subscription.IsActive && subscription.EndDate >= DateTime.UtcNow,
                available > 0 ? $"رصيدك الحالي {available} نقطة" : "لا توجد نقاط متاحة"
            );
        }

        private static string FormatPoints(int points) =>
            points == 1 ? "نقطة واحدة" : $"{points} نقاط";

        private void LogPointDeduction(
            Guid lawyerId,
            Guid subscriptionId,
            Guid? aiJobId,
            Guid? caseId,
            string? workflowType,
            string? workflowRunId,
            AiStepType stepType,
            int points,
            int balanceBefore,
            int balanceAfter,
            string messageAr)
        {
            _logger.LogInformation(
                "AI point deducted. LawyerId={LawyerId} SubscriptionId={SubscriptionId} AiJobId={AiJobId} CaseId={CaseId} WorkflowType={WorkflowType} WorkflowRunId={WorkflowRunId} StepType={StepType} Points={Points} BalanceBefore={BalanceBefore} BalanceAfter={BalanceAfter} Message={Message}",
                lawyerId,
                subscriptionId,
                aiJobId,
                caseId,
                workflowType,
                workflowRunId,
                stepType,
                points,
                balanceBefore,
                balanceAfter,
                messageAr);
        }
    }
}
