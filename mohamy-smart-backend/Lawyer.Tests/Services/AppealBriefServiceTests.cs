using FluentAssertions;
using Lawyer.Application.Dtos.AppealBrief;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Lawyer.Core.Exceptions;
using Lawyer.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Moq;

namespace Lawyer.Tests.Services;

public class AppealBriefServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly Mock<IAIProviderFactory> _aiProviderFactory = new();
    private readonly Mock<IAIProvider> _aiProvider = new();
    private readonly Mock<ICaseAccessValidator> _caseAccessValidator = new();
    private readonly IConfiguration _configuration;

    public AppealBriefServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"AppealBriefServiceTests-{Guid.NewGuid()}")
            .Options;

        _dbContext = new AppDbContext(options);

        var contentRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "Lawyer"));
        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                [WebHostDefaults.ContentRootKey] = contentRoot
            })
            .Build();

        _aiProviderFactory.Setup(x => x.GetProvider()).Returns(_aiProvider.Object);
        _aiProviderFactory.Setup(x => x.GetModelForStepAsync(AiStepType.AppealBriefJudgmentData)).ReturnsAsync("test-model");
        _caseAccessValidator
            .Setup(v => v.ValidateAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Result<bool> { Data = true, Succeeded = true, StatusCode = System.Net.HttpStatusCode.OK });
    }

    [Fact]
    public async Task RunStepAsync_ShouldWrapPlainTextAiResponse_IntoStep1JsonShape()
    {
        var caseId = Guid.NewGuid();
        var lawyerId = Guid.NewGuid().ToString();
        var workflowId = await SeedWorkflowAsync(caseId, lawyerId);

        _aiProvider
            .Setup(x => x.SendChatCompletionAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<AIRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result<AIResponse>.Success(new AIResponse("""
            {
              "fullAppealText": "تعذر استخراج كل بيانات الحكم، لكن الثابت أن منطوقه يقضي برفض الاستئناف وتأييد الحكم المستأنف."
            }
            """, null)));

        var service = CreateSut();

        var result = await service.RunStepAsync(
            workflowId,
            1,
            new RunStepRequest { Input = $"{{\"caseId\":\"{caseId}\",\"input\":\"المتهم حضر أمام المحكمة وتمسك بدفاعه\"}}" },
            lawyerId,
            CancellationToken.None);

        result.Succeeded.Should().BeTrue($"Status: {result.StatusCode}. Message: {result.Message}. Errors: {string.Join(", ", result.Errors)}");

        var persistedWorkflow = await _dbContext.AppealWorkflows.FindAsync(workflowId);
        persistedWorkflow.Should().NotBeNull();
        persistedWorkflow!.CurrentStep.Should().Be(2);
        persistedWorkflow.Step1Output.Should().NotBeNull();

        using var json = System.Text.Json.JsonDocument.Parse(persistedWorkflow.Step1Output!);
        json.RootElement.GetProperty("fullAppealText").GetString().Should().Contain("رفض الاستئناف");
    }

    [Fact]
    public async Task StartNewRunAsync_ShouldSnapshotLatestCompletedAppealBeforeCreatingNewRun()
    {
        var caseId = Guid.NewGuid();
        var lawyerId = Guid.NewGuid().ToString();
        var workflowId = await SeedWorkflowAsync(caseId, lawyerId);

        var workflow = await _dbContext.AppealWorkflows.FindAsync(workflowId);
        workflow.Should().NotBeNull();
        workflow!.Status = WorkflowStatus.Completed;
        workflow.CurrentStep = 6;
        workflow.CurrentAccessibleStep = 6;
        workflow.LastCompletedStep = 6;
        workflow.Step1Output = """
        {
          "judgmentData": { "courtName": "محكمة النقض", "caseNumber": "321/2026" },
          "fullAppealText": "بيانات الحكم القديمة"
        }
        """;
        workflow.Step2Output = """
        {
          "fullAppealText": "تحليل أسباب الحكم القديم"
        }
        """;
        workflow.UpdatedAt = DateTime.UtcNow.AddMinutes(-1);
        await _dbContext.SaveChangesAsync();
        _dbContext.ChangeTracker.Clear();

        var service = CreateSut();

        var result = await service.StartNewRunAsync(caseId, lawyerId, CancellationToken.None);

        result.Succeeded.Should().BeTrue($"Status: {result.StatusCode}. Message: {result.Message}");
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().NotBe(workflowId);
        result.Data.CurrentAccessibleStep.Should().Be(0);

        var archivedWorkflow = await _dbContext.AppealWorkflows.FindAsync(workflowId);
        archivedWorkflow.Should().NotBeNull();
        archivedWorkflow!.Status.Should().Be(WorkflowStatus.Abandoned);

        var snapshot = await _dbContext.WorkflowSnapshots.SingleAsync(s => s.CaseId == caseId && s.WorkflowType == "appeal-brief");
        using var snapshotJson = System.Text.Json.JsonDocument.Parse(snapshot.OutputsJson);
        snapshotJson.RootElement.GetProperty("1").GetProperty("fullAppealText").GetString().Should().Be("بيانات الحكم القديمة");
        snapshotJson.RootElement.GetProperty("2").GetProperty("fullAppealText").GetString().Should().Be("تحليل أسباب الحكم القديم");

        var newWorkflow = await _dbContext.AppealWorkflows.FindAsync(result.Data.Id);
        newWorkflow.Should().NotBeNull();
        newWorkflow!.Status.Should().Be(WorkflowStatus.InProgress);
        newWorkflow.CurrentAccessibleStep.Should().Be(0);
        newWorkflow.Step1Output.Should().BeNull();
    }

    private AppealBriefService CreateSut()
    {
        var uow = new Lawyer.Infrastructure.Persistence.Repositories.UnitOfWork(
            _dbContext,
            new Mock<Microsoft.AspNetCore.Identity.UserManager<Lawyer.Core.Models.ApplicationUser>>(
                Mock.Of<Microsoft.AspNetCore.Identity.IUserStore<Lawyer.Core.Models.ApplicationUser>>(),
                null!, null!, null!, null!, null!, null!, null!, null!).Object);
        return new AppealBriefService(uow, Mock.Of<ILogger<AppealBriefService>>(), _aiProviderFactory.Object, _configuration, _caseAccessValidator.Object, Mock.Of<IAiUsageTrackingService>(), new Lawyer.Application.Common.PromptTemplateCache(_configuration[WebHostDefaults.ContentRootKey]!));
    }

    private async Task<int> SeedWorkflowAsync(Guid caseId, string lawyerId)
    {
        if (!await _dbContext.CaseTypes.AnyAsync(x => x.Id == 1))
        {
            _dbContext.CaseTypes.Add(new CaseType { Id = 1, Title = "Appeal" });
            await _dbContext.SaveChangesAsync();
        }

        _dbContext.Cases.Add(new Case
        {
            Id = caseId,
            CaseTypeId = 1,
            LawyerId = Guid.NewGuid(),
            Title = "طعن بالنقض",
            Number = "321/2026",
            Court = "محكمة النقض",
            ClientName = "أحمد علي",
            ApponentName = "النيابة العامة",
            Description = "طعن على حكم جنائي.",
            Facts = "صدر الحكم المطعون عليه بعدة أسباب محل منازعة.",
            Status = CaseStatus.Open
        });
        await _dbContext.SaveChangesAsync();

        var workflow = new AppealWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            RowVersion = [1]
        };

        _dbContext.AppealWorkflows.Add(workflow);
        await _dbContext.SaveChangesAsync();
        _dbContext.ChangeTracker.Clear();
        return workflow.Id;
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
