using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Lawyer.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lawyer.Tests.Services;

public class AiUsageReportServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;

    public AiUsageReportServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"AiUsageReportServiceTests-{Guid.NewGuid()}")
            .Options;

        _dbContext = new AppDbContext(options);
    }

    [Fact]
    public void CalculateGeminiCost_Gemini35Flash_UsesPaidTierTokenPricing()
    {
        var cost = AiCostCalculator.CalculateGeminiCost("gemini-3.5-flash", 1_000_000, 1_000_000);

        cost.Should().Be(10.50m);
    }

    [Fact]
    public async Task GetModelUsageAsync_NoGemini35FlashUsage_IncludesZeroRow()
    {
        var sut = CreateSut();

        var result = await sut.GetModelUsageAsync(null, null, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        var model = result.Data.Should().ContainSingle(m => m.ModelIdentifier == "gemini-3.5-flash").Subject;
        model.DisplayName.Should().Be("Gemini 3.5 Flash");
        model.RequestCount.Should().Be(0);
        model.TotalCostUsd.Should().Be(0);
        model.InputTokens.Should().Be(0);
        model.OutputTokens.Should().Be(0);
    }

    [Fact]
    public async Task GetLawyerUsageDetailAsync_NonCaseOcrAndChatRecords_AppearAsStandaloneCosts()
    {
        var now = DateTime.UtcNow;
        var lawyerId = Guid.NewGuid();
        var applicationUserId = Guid.NewGuid();

        var user = new ApplicationUser
        {
            Id = applicationUserId,
            FullName = "standalone usage lawyer",
            UserName = "standalone@example.com",
            Email = "standalone@example.com",
            UserType = UserType.Lawyer,
            IsActive = true
        };

        var lawyer = new Core.Models.Lawyer
        {
            Id = lawyerId,
            ApplicationUserId = applicationUserId,
            ApplicationUser = user,
            Created = now,
            CreatedBy = applicationUserId,
            UpdatedBy = applicationUserId,
            IsActive = true
        };
        user.Lawyer = lawyer;

        _dbContext.Users.Add(user);
        _dbContext.Set<Core.Models.Lawyer>().Add(lawyer);
        _dbContext.AiUsageRecords.AddRange(
            new AiUsageRecord
            {
                Id = Guid.NewGuid(),
                LawyerId = lawyerId,
                Provider = "GoogleVision",
                ModelIdentifier = "google-vision",
                AiStepType = AiStepType.Ocr,
                EstimatedCostUsd = 0.02m,
                CreatedAt = now
            },
            new AiUsageRecord
            {
                Id = Guid.NewGuid(),
                LawyerId = lawyerId,
                Provider = "Gemini",
                ModelIdentifier = "gemini-3.5-flash",
                AiStepType = AiStepType.Chat,
                EstimatedCostUsd = 0.03m,
                InputTokens = 100,
                OutputTokens = 50,
                TotalTokens = 150,
                CreatedAt = now
            });
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();

        var result = await sut.GetLawyerUsageDetailAsync(lawyerId, null, null, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data!.PerCaseWorkflows.Should().BeEmpty();
        result.Data.StandaloneCosts.Should().HaveCount(2);
        result.Data.StandaloneCosts.Should().Contain(w =>
            w.WorkflowKey == "ocr" &&
            w.WorkflowName == "التعرف البصري OCR" &&
            w.RequestCount == 1 &&
            w.TotalCostUsd == 0.02m);
        result.Data.StandaloneCosts.Should().Contain(w =>
            w.WorkflowKey == "chat" &&
            w.WorkflowName == "المحادثة" &&
            w.RequestCount == 1 &&
            w.TotalCostUsd == 0.03m);
    }

    [Fact]
    public async Task GetLawyerUsageDetailAsync_LawyerId_IncludesRecordsStoredWithApplicationUserId()
    {
        var now = DateTime.UtcNow;
        var lawyerId = Guid.NewGuid();
        var applicationUserId = Guid.NewGuid();

        var user = new ApplicationUser
        {
            Id = applicationUserId,
            FullName = "mazen elsbagh",
            UserName = "mazen@example.com",
            Email = "mazen@example.com",
            UserType = UserType.Lawyer,
            IsActive = true
        };

        var lawyer = new Core.Models.Lawyer
        {
            Id = lawyerId,
            ApplicationUserId = applicationUserId,
            ApplicationUser = user,
            Created = now,
            CreatedBy = applicationUserId,
            UpdatedBy = applicationUserId,
            IsActive = true
        };
        user.Lawyer = lawyer;

        _dbContext.Users.Add(user);
        _dbContext.Set<Core.Models.Lawyer>().Add(lawyer);
        _dbContext.AiUsageRecords.AddRange(
            new AiUsageRecord
            {
                Id = Guid.NewGuid(),
                LawyerId = lawyerId,
                Provider = "Gemini",
                ModelIdentifier = "gemini-3.1-pro-preview",
                AiStepType = AiStepType.FactAnalysis,
                EstimatedCostUsd = 0.46m,
                InputTokens = 100,
                OutputTokens = 50,
                TotalTokens = 150,
                CreatedAt = now
            },
            new AiUsageRecord
            {
                Id = Guid.NewGuid(),
                LawyerId = applicationUserId,
                Provider = "Gemini",
                ModelIdentifier = "gemini-3.1-pro-preview",
                AiStepType = AiStepType.Chat,
                EstimatedCostUsd = 5.32m,
                InputTokens = 200,
                OutputTokens = 80,
                TotalTokens = 280,
                CreatedAt = now
            });
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();

        var result = await sut.GetLawyerUsageDetailAsync(lawyerId, null, null, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.LawyerId.Should().Be(lawyerId);
        result.Data.LawyerName.Should().Be("mazen elsbagh");
        result.Data.AiCostUsd.Should().Be(5.78m);
        result.Data.TotalCostUsd.Should().Be(5.78m);
        result.Data.TotalRequests.Should().Be(2);
    }

    [Fact]
    public async Task GetLawyerUsageDetailAsync_GroupsWorkflowCostsByRun()
    {
        var now = DateTime.UtcNow;
        var lawyerId = Guid.NewGuid();
        var applicationUserId = Guid.NewGuid();
        var caseId = Guid.NewGuid();

        var user = new ApplicationUser
        {
            Id = applicationUserId,
            FullName = "محامي الاختبار",
            UserName = "workflow@example.com",
            Email = "workflow@example.com",
            UserType = UserType.Lawyer,
            IsActive = true
        };

        var lawyer = new Core.Models.Lawyer
        {
            Id = lawyerId,
            ApplicationUserId = applicationUserId,
            ApplicationUser = user,
            Created = now,
            CreatedBy = applicationUserId,
            UpdatedBy = applicationUserId,
            IsActive = true
        };
        user.Lawyer = lawyer;

        _dbContext.Users.Add(user);
        _dbContext.Set<Core.Models.Lawyer>().Add(lawyer);
        _dbContext.Cases.Add(new Case
        {
            Id = caseId,
            LawyerId = lawyerId,
            Title = "قضية تكلفة النسخ",
            Number = "2026/99",
            Court = "محكمة الاختبار",
            ClientName = "عميل الاختبار",
            Status = CaseStatus.Open,
            CaseTypeId = 1,
            Facts = "وقائع",
            LegalClaims = "طلبات",
            Created = now,
            CreatedBy = applicationUserId,
            UpdatedBy = applicationUserId,
            IsActive = true
        });
        _dbContext.AiUsageRecords.AddRange(
            new AiUsageRecord
            {
                Id = Guid.NewGuid(),
                LawyerId = lawyerId,
                CaseId = caseId,
                WorkflowId = 10,
                WorkflowRunId = "run-one",
                WorkflowType = "defense-memo",
                Provider = "Gemini",
                ModelIdentifier = "gemini-3.1-pro-preview",
                AiStepType = AiStepType.FactAnalysis,
                EstimatedCostUsd = 0.39m,
                CreatedAt = now
            },
            new AiUsageRecord
            {
                Id = Guid.NewGuid(),
                LawyerId = lawyerId,
                CaseId = caseId,
                WorkflowId = 10,
                WorkflowRunId = "run-one",
                WorkflowType = "defense-memo",
                Provider = "Gemini",
                ModelIdentifier = "gemini-3.1-pro-preview",
                AiStepType = AiStepType.GenerateDefenses,
                EstimatedCostUsd = 0.12m,
                CreatedAt = now
            },
            new AiUsageRecord
            {
                Id = Guid.NewGuid(),
                LawyerId = lawyerId,
                CaseId = caseId,
                WorkflowId = 11,
                WorkflowRunId = "run-two",
                WorkflowType = "defense-memo",
                Provider = "Gemini",
                ModelIdentifier = "gemini-3.1-pro-preview",
                AiStepType = AiStepType.FactAnalysis,
                EstimatedCostUsd = 0.25m,
                CreatedAt = now.AddMinutes(1)
            });
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();

        var result = await sut.GetLawyerUsageDetailAsync(lawyerId, null, null, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        var caseUsage = result.Data!.PerCaseWorkflows.Single();
        caseUsage.UsedWorkflowCount.Should().Be(1);
        caseUsage.Workflows.Should().HaveCount(2);
        caseUsage.Workflows.Select(w => w.WorkflowRunId).Should().BeEquivalentTo("run-one", "run-two");
        caseUsage.Workflows.Single(w => w.WorkflowRunId == "run-one").TotalCostUsd.Should().Be(0.51m);
        caseUsage.Workflows.Single(w => w.WorkflowRunId == "run-two").TotalCostUsd.Should().Be(0.25m);
    }

    private AiUsageReportService CreateSut()
    {
        return new AiUsageReportService(
            new UnitOfWork(_dbContext, CreateUserManager()),
            new Mock<ILogger<AiUsageReportService>>().Object);
    }

    private static UserManager<ApplicationUser> CreateUserManager()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        return new Mock<UserManager<ApplicationUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!).Object;
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
