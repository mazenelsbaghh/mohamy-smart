using Hangfire;
using Lawyer.Application.Common;
using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;

namespace Lawyer.Application.Services.SmartAnalysis
{
    public class SmartChatService : ISmartChatService
    {
        private const int FreeSuccessfulChatReplies = 5;
        private const int MaxSelectedInternalRegulations = 3;
        private const int MaxContextCharactersPerRegulation = 12000;
        private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> ChatQuotaLocks = new();
        private readonly ILogger<SmartChatService> _logger;
        private readonly IAIProviderFactory _aiProviderFactory;
        private readonly IAiUsageTrackingService _trackingService;
        private readonly IAiPointAccountingService _pointAccounting;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBackgroundJobClient? _backgroundJobs;

        public SmartChatService(
            ILogger<SmartChatService> logger,
            IAIProviderFactory aiProviderFactory,
            IAiUsageTrackingService trackingService,
            IAiPointAccountingService pointAccounting,
            IUnitOfWork unitOfWork,
            IBackgroundJobClient? backgroundJobs = null)
        {
            _logger = logger;
            _aiProviderFactory = aiProviderFactory;
            _trackingService = trackingService;
            _pointAccounting = pointAccounting;
            _unitOfWork = unitOfWork;
            _backgroundJobs = backgroundJobs;
        }

        private async Task TrackUsageAsync(Guid lawyerId, Guid? caseId, AiStepType step, string model, AIUsageMetadata? usage)
        {
            if (_backgroundJobs != null)
            {
                _backgroundJobs.Enqueue<IAiUsageTrackingService>(s =>
                    s.RecordGeminiUsageAsync(lawyerId, caseId, step, model, usage, CancellationToken.None, null, null, null));
            }
            else
            {
                await _trackingService.RecordGeminiUsageAsync(lawyerId, caseId, step, model, usage, CancellationToken.None);
            }
        }

        public async Task<Result<ChatResponseDto>> ChatAsync(Guid lawyerId, ChatRequestDto request, CancellationToken cancellationToken)
        {
            try
            {
                var quotaLock = ChatQuotaLocks.GetOrAdd(lawyerId, _ => new SemaphoreSlim(1, 1));
                await quotaLock.WaitAsync(cancellationToken);
                try
                {
                    var cid = request.ConversationId ?? Guid.NewGuid();
                    var successfulChatCount = await GetSuccessfulChatReplyCountAsync(lawyerId, cancellationToken);
                    var isFreeChatReply = successfulChatCount < FreeSuccessfulChatReplies;
                    if (!isFreeChatReply)
                    {
                        var availability = await _pointAccounting.ValidateCanStartAsync(
                            lawyerId,
                            AiStepType.Chat,
                            null,
                            "SmartChat",
                            cancellationToken);
                        if (!availability.Succeeded)
                        {
                            return Result<ChatResponseDto>.Error(availability.StatusCode, availability.Message);
                        }
                    }

                    var aiProvider = _aiProviderFactory.GetProvider();
                    var chatModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.Chat);
                    request.InternalRegulationIds ??= new List<Guid>();
                    var selectedRegulations = await LoadSelectedInternalRegulationsAsync(lawyerId, request.InternalRegulationIds, cancellationToken);
                    var selectedRegulationsContext = BuildSelectedInternalRegulationsContext(selectedRegulations);
                    var caseContext = await BuildCaseContextForChatAsync(lawyerId, request.ContextCaseId, cancellationToken);

                    var systemPrompt = $"""
                        أنت المساعد القانوني الذكي الرسمي لمنصة محامي سمارت.

                        قواعد هوية المساعد:
                        - إذا سُئلت: من أنت؟ أو ما اسمك؟ أو من الذي يجيب؟ فالإجابة الصحيحة الوحيدة هي:
                          "أنا المساعد القانوني الذكي لمنصة محامي سمارت."
                        - ممنوع تمامًا ذكر اسم الشركة أو مزود الذكاء الاصطناعي أو اسم النموذج أو الإصدار أو أي تفاصيل تقنية.
                        - ممنوع قول: Gemini أو جميناي أو جيمناي أو ChatGPT أو OpenAI أو Claude أو DeepSeek أو أي اسم مشابه.
                        - ممنوع قول إنك نموذج ذكاء اصطناعي أو موديل أو LLM أو برنامج تابع لجهة خارجية.

                        قواعد الأسلوب:
                        - أجب باللغة العربية فقط.
                        - استخدم أسلوبًا مهنيًا مباشرًا وواضحًا.
                        - لا تستخدم أي تنسيق Markdown أو رموز زخرفية مثل: ** أو ## أو ` أو __.
                        - أخرج النص النهائي كنص عادي نظيف وجاهز للعرض مباشرة.

                        قواعد اللوائح الداخلية المختارة:
                        - إذا وُجد سياق بعنوان "اللوائح الداخلية المختارة للشات"، فاجعل الإجابة مبنية على هذه اللوائح قدر الإمكان.
                        - عند الاستناد إلى لائحة مختارة، اذكر اسم اللائحة أو رقمها داخل الإجابة.
                        - إذا كان السؤال خارج نطاق اللائحة المختارة، وضح ذلك وبيّن ما يمكن استخلاصه من اللائحة فقط.

                        قواعد سياق القضية:
                        - إذا وُجد سياق بعنوان "بيانات القضية الحالية"، فالتزم به في تحديد موكل المكتب والطرف الذي يجب حماية موقفه.
                        - ممنوع تقديم صياغة أو نصيحة تضر بالطرف الذي يجب حماية موقفه في القضية الحالية.

                        {caseContext}

                        {selectedRegulationsContext}
                        """;
                    var aiResult = await aiProvider.SendChatCompletionAsync(
                        systemPrompt,
                        request.Message,
                        AIRequestOptions.Default with { Model = chatModel },
                        cancellationToken);

                    var messages = new List<ChatMessageDto>
                    {
                        new ChatMessageDto
                        {
                            MessageId = Guid.NewGuid(),
                            Role = "user",
                            Content = request.Message,
                            CreatedAt = DateTime.UtcNow
                        }
                    };

                    var state = "available";
                    if (!aiResult.Succeeded || string.IsNullOrWhiteSpace(aiResult.Data?.Content))
                    {
                        state = "error";
                    }
                    else
                    {
                        var accountingResult = isFreeChatReply
                            ? await _pointAccounting.RecordNoChargeDirectActionAsync(
                                lawyerId,
                                AiStepType.Chat,
                                request.ContextCaseId,
                                "SmartChat",
                                cid.ToString(),
                                "رسالة الشات ضمن أول 5 رسائل مجانية.",
                                cancellationToken)
                            : await _pointAccounting.ChargeSuccessfulDirectActionAsync(
                                lawyerId,
                                AiStepType.Chat,
                                1,
                                request.ContextCaseId,
                                "SmartChat",
                                cid.ToString(),
                                "تم خصم نقطة واحدة بعد استخدام أول 5 رسائل مجانية في الشات.",
                                cancellationToken);
                        if (!accountingResult.Succeeded)
                        {
                            return Result<ChatResponseDto>.Error(accountingResult.StatusCode, accountingResult.Message);
                        }

                        await RecordChatUsageAsync(lawyerId, request.ContextCaseId, chatModel, aiResult.Data.Usage, cancellationToken);
                        messages.Add(new ChatMessageDto
                        {
                            MessageId = Guid.NewGuid(),
                            Role = "assistant",
                            Content = SanitizeChatAssistantResponse(aiResult.Data.Content),
                            CreatedAt = DateTime.UtcNow
                        });
                    }

                    var response = new ChatResponseDto
                    {
                        ConversationId = cid,
                        Messages = messages,
                        AvailabilityState = state
                    };

                    return Result<ChatResponseDto>.Success(response, "تم إرسال الرسالة بنجاح");
                }
                finally
                {
                    quotaLock.Release();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chat message for Lawyer {LawyerId}", lawyerId);
                return Result<ChatResponseDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء معالجة الرسالة");
            }
        }

        private async Task<int> GetSuccessfulChatReplyCountAsync(Guid lawyerId, CancellationToken cancellationToken)
        {
            return await _unitOfWork.Repository<AiUsageRecord>()
                .AsQueryable()
                .AsNoTracking()
                .CountAsync(record => record.LawyerId == lawyerId && record.AiStepType == AiStepType.Chat, cancellationToken);
        }

        private async Task RecordChatUsageAsync(Guid lawyerId, Guid? caseId, string modelIdentifier, AIUsageMetadata? usage, CancellationToken cancellationToken)
        {
            var inputTokens = usage?.InputTokens ?? 0;
            var outputTokens = usage?.OutputTokens ?? 0;
            var totalTokens = usage?.TotalTokens ?? 0;
            var cost = usage != null
                ? Lawyer.Application.Services.AiCostCalculator.CalculateGeminiCost(modelIdentifier, inputTokens, outputTokens)
                : 0m;

            await _unitOfWork.Repository<AiUsageRecord>().AddAsync(new AiUsageRecord
            {
                LawyerId = lawyerId,
                CaseId = caseId,
                AiStepType = AiStepType.Chat,
                ModelIdentifier = modelIdentifier,
                Provider = "Gemini",
                InputTokens = inputTokens,
                OutputTokens = outputTokens,
                TotalTokens = totalTokens,
                EstimatedCostUsd = cost,
                CreatedAt = DateTime.UtcNow
            });
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        private static string SanitizeChatAssistantResponse(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return string.Empty;

            var sanitized = text.Trim();

            sanitized = Regex.Replace(
                sanitized,
                @"\b(Gemini|Google Gemini|Claude|OpenAI|ChatGPT|DeepSeek|Deep Seek|LLM|AI model|language model|جميناي|جيمناي|جيمني|شات جي بي تي|شاتGPT|كلود|ديب سيك)\b",
                "المساعد القانوني الذكي",
                RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

            sanitized = Regex.Replace(
                sanitized,
                @"\b(أنا\s+(?:نموذج|موديل|ذكاء اصطناعي|مساعد)\s+تابع\s+لـ?\s*[^\r\n\.\،,]+)",
                "أنا المساعد القانوني الذكي لمنصة محامي سمارت",
                RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

            sanitized = Regex.Replace(
                sanitized,
                @"أنا\s+مساعدك\s+القانوني\s+الذكي\s*\((?:[^)]*(?:جميناي|جيمناي|Gemini|ChatGPT|Claude)[^)]*)\)",
                "أنا مساعدك القانوني الذكي",
                RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

            sanitized = Regex.Replace(
                sanitized,
                @"\((?:[^)]*(?:جميناي|جيمناي|Gemini|ChatGPT|Claude)[^)]*)\)",
                string.Empty,
                RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

            sanitized = sanitized
                .Replace("**", string.Empty)
                .Replace("__", string.Empty)
                .Replace("`", string.Empty)
                .Replace("###", string.Empty)
                .Replace("##", string.Empty)
                .Replace("#", string.Empty);

            sanitized = Regex.Replace(sanitized, @"^[\-\*\u2022]\s+", string.Empty, RegexOptions.Multiline);
            sanitized = Regex.Replace(sanitized, @"\n{3,}", "\n\n");

            return sanitized.Trim();
        }

        private async Task<List<InternalRegulation>> LoadSelectedInternalRegulationsAsync(Guid userId, IReadOnlyCollection<Guid> requestedIds, CancellationToken cancellationToken)
        {
            var ids = requestedIds
                .Where(id => id != Guid.Empty)
                .Distinct()
                .Take(MaxSelectedInternalRegulations)
                .ToList();

            if (ids.Count == 0)
                return new List<InternalRegulation>();

            var lawyerId = await _unitOfWork.Repository<Core.Models.Lawyer>()
                .AsQueryable()
                .AsNoTracking()
                .Where(l => l.ApplicationUserId == userId)
                .Select(l => l.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (lawyerId == Guid.Empty)
                return new List<InternalRegulation>();

            var regulations = await _unitOfWork.Repository<InternalRegulation>()
                .AsQueryable()
                .AsNoTracking()
                .Where(regulation =>
                    regulation.LawyerId == lawyerId &&
                    regulation.IsActive &&
                    ids.Contains(regulation.Id))
                .ToListAsync(cancellationToken);

            return regulations
                .OrderBy(regulation => ids.IndexOf(regulation.Id))
                .ToList();
        }

        private static string BuildSelectedInternalRegulationsContext(IReadOnlyCollection<InternalRegulation> regulations)
        {
            if (regulations.Count == 0)
                return string.Empty;

            var sb = new StringBuilder();
            sb.AppendLine("اللوائح الداخلية المختارة للشات:");

            foreach (var regulation in regulations)
            {
                sb.AppendLine($"- العنوان: {regulation.Title}");
                if (!string.IsNullOrWhiteSpace(regulation.RegulationNumber))
                    sb.AppendLine($"  رقم اللائحة: {regulation.RegulationNumber}");
                if (!string.IsNullOrWhiteSpace(regulation.IssuingAuthority))
                    sb.AppendLine($"  جهة الإصدار: {regulation.IssuingAuthority}");
                if (!string.IsNullOrWhiteSpace(regulation.Summary))
                    sb.AppendLine($"  الملخص: {regulation.Summary}");

                var content = regulation.Content.Trim();
                if (content.Length > MaxContextCharactersPerRegulation)
                    content = content[..MaxContextCharactersPerRegulation] + "\n[تم اختصار نص اللائحة الداخلية لطولها.]";

                sb.AppendLine("  النص:");
                sb.AppendLine(content);
                sb.AppendLine();
            }

            return sb.ToString().Trim();
        }

        private async Task<string> BuildCaseContextForChatAsync(Guid lawyerId, Guid? caseId, CancellationToken cancellationToken)
        {
            if (caseId == null || caseId == Guid.Empty)
                return string.Empty;

            var caseEntity = await _unitOfWork.Repository<Core.Models.Case>()
                .AsQueryable()
                .AsNoTracking()
                .Include(c => c.CaseType)
                .Where(c =>
                    c.Id == caseId.Value &&
                    (c.LawyerId == lawyerId || c.Lawyer.ApplicationUserId == lawyerId))
                .FirstOrDefaultAsync(cancellationToken);

            if (caseEntity == null)
                return string.Empty;

            return $"بيانات القضية الحالية:\n{AnalysisHelpers.BuildCaseContext(caseEntity, caseEntity.CaseType?.Title)}";
        }
    }
}
