using FluentAssertions;
using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Application.Services.SmartAnalysis;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Lawyer.Infrastructure.Persistence.Repositories;
using Lawyer.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Lawyer.Tests.Services;

public class DefenseMemoCheckpointTests
{
    [Fact]
    public async Task ProductionRegression20260619_FailedSectionRetry_ReusesCompletedSections()
    {
        var dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"DefenseMemoCheckpoint-{Guid.NewGuid()}")
            .Options;
        await using var db = new AppDbContext(dbOptions);

        var lawyerId = Guid.NewGuid();
        var caseId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        db.CaseTypes.Add(new CaseType { Id = 1, Title = "جنائي" });
        db.Cases.Add(new Case
        {
            Id = caseId,
            LawyerId = lawyerId,
            CaseTypeId = 1,
            Title = "قضية اختبار",
            Number = "123",
            Court = "محكمة الاختبار",
            ClientName = "المتهم",
            ApponentName = "النيابة"
        });
        db.AiJobs.Add(new AiJob
        {
            Id = jobId,
            CaseId = caseId,
            StepType = AiStepType.DefenseMemoDraft,
            Status = AiJobStatus.Processing
        });
        await db.SaveChangesAsync();

        var provider = new Mock<IAIProvider>();
        provider.SetupGet(candidate => candidate.ProviderName).Returns("Test");
        provider.SetupSequence(candidate => candidate.SendChatCompletionAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<AIRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(AiSuccess("""
                {"openingHtml":"<p>المقدمة</p>","factsHtml":"<p>الوقائع</p>","requestsHtml":"<p>الطلبات</p>","closingHtml":"<p>الختام</p>"}
                """))
            .ReturnsAsync(AiSuccess("<p>الدفع الأول المكتمل</p>"))
            .ReturnsAsync(Result<AIResponse>.Error(System.Net.HttpStatusCode.BadGateway, "provider failed"))
            .ReturnsAsync(AiSuccess("<p>الدفع الثاني المكتمل</p>"));

        var providerFactory = new Mock<IAIProviderFactory>();
        providerFactory.Setup(factory => factory.GetProvider()).Returns(provider.Object);
        providerFactory.Setup(factory => factory.GetModelForStepAsync(AiStepType.DefenseMemoDraft)).ReturnsAsync("test-model");

        var accessValidator = new Mock<ICaseAccessValidator>();
        accessValidator.Setup(validator => validator.ValidateAsync(caseId, It.IsAny<string>(), false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Result<bool>
            {
                Succeeded = true,
                Data = true,
                StatusCode = System.Net.HttpStatusCode.OK
            });

        var promptService = new Mock<IPromptService>();
        promptService.Setup(service => service.GetPromptIfExistsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("prompt");

        var service = new DefenseService(
            new UnitOfWork(db, MockUserManager.Create().Object),
            Mock.Of<ILogger<DefenseService>>(),
            providerFactory.Object,
            accessValidator.Object,
            Mock.Of<IAiUsageTrackingService>(),
            promptService.Object);
        var request = CreateRequest(caseId, jobId);

        var firstAttempt = await service.GenerateDefenseMemoDraftAsync(request, lawyerId.ToString(), CancellationToken.None);
        firstAttempt.Succeeded.Should().BeFalse();

        var resumedAttempt = await service.GenerateDefenseMemoDraftAsync(request, lawyerId.ToString(), CancellationToken.None);

        resumedAttempt.Succeeded.Should().BeTrue();
        resumedAttempt.Data!.MemoHtml.Should().Contain("الدفع الأول المكتمل");
        resumedAttempt.Data.MemoHtml.Should().Contain("الدفع الثاني المكتمل");
    }

    private static DefenseMemoDraftRequestDto CreateRequest(Guid caseId, Guid jobId) => new()
    {
        JobId = jobId,
        CaseId = caseId,
        RunId = "run-1",
        CaseNumber = "123",
        CaseType = "جنائي",
        CourtName = "محكمة الاختبار",
        ClientName = "المتهم",
        ApponentName = "النيابة",
        DefendingParty = "client",
        LegalFactsSummary = ["واقعة الاختبار"],
        ApprovedDefenses =
        [
            new ApprovedDefenseInput { DefenseTitle = "الدفع الأول", Type = "موضوعي" },
            new ApprovedDefenseInput { DefenseTitle = "الدفع الثاني", Type = "موضوعي" }
        ],
        FinalRequests = [new FinalRequestInput { RequestLevel = "أصلي", RequestText = "البراءة" }]
    };

    private static Result<AIResponse> AiSuccess(string content) =>
        Result<AIResponse>.Success(new AIResponse(content, new AIUsageMetadata(10, 10, 20)));
}
