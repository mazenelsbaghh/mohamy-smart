using FluentAssertions;
using Lawyer.Application.Dtos.AdminComplaint;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;

namespace Lawyer.Tests.Services;

public class AdminComplaintServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly Mock<IAIProviderFactory> _aiProviderFactory = new();
    private readonly Mock<IAIProvider> _aiProvider = new();
    private readonly IConfiguration _configuration;

    public AdminComplaintServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"AdminComplaintServiceTests-{Guid.NewGuid()}")
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
        _aiProviderFactory.Setup(x => x.GetModelForStepAsync(AiStepType.AdminComplaintClassification)).ReturnsAsync("test-model");
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
              "complaintType": "تظلم إداري",
              "targetAuthority": "الجهة الإدارية المختصة",
              "legalBasis": "هذه الشكوى تدخل في اختصاص الجهة الإدارية المختصة بسبب مخالفة القرار الإداري."
            }
            """, null)));

        var service = CreateSut();

        var result = await service.RunStepAsync(
            workflowId,
            1,
            new RunComplaintStepRequest { Input = $"{{\"caseId\":\"{caseId}\"}}" },
            lawyerId,
            CancellationToken.None);

        result.Succeeded.Should().BeTrue($"because the step should run successfully. Status: {result.StatusCode}. Message: {result.Message}. Errors: {string.Join(", ", result.Errors)}");

        var persistedWorkflow = await _dbContext.AdminComplaintWorkflows.FindAsync(workflowId);
        persistedWorkflow.Should().NotBeNull();
        persistedWorkflow!.CurrentStep.Should().Be(2);
        persistedWorkflow.Step1Output.Should().NotBeNull();
        persistedWorkflow.Step1Output.Should().Contain("legalBasis");

        using var json = System.Text.Json.JsonDocument.Parse(persistedWorkflow.Step1Output!);
        json.RootElement.GetProperty("complaintType").GetString().Should().Be("تظلم إداري");
        json.RootElement.GetProperty("targetAuthority").GetString().Should().Be("الجهة الإدارية المختصة");
        json.RootElement.GetProperty("legalBasis").GetString().Should().Contain("هذه الشكوى تدخل في اختصاص");
    }

    [Fact]
    public async Task StartFromSnapshotAsync_ShouldCreateEditableRunWithSnapshotOutputs()
    {
        var caseId = Guid.NewGuid();
        var lawyerId = Guid.NewGuid().ToString();
        var activeWorkflowId = await SeedWorkflowAsync(caseId, lawyerId);

        var snapshot = new WorkflowSnapshot
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            WorkflowType = "admin-complaint",
            CurrentStep = 2,
            OutputsJson = """
            {
              "1": { "complaintType": "تظلم إداري", "targetAuthority": "الجهة الإدارية" },
              "2": { "factsSummary": "وقائع النسخة السابقة" }
            }
            """
        };
        _dbContext.WorkflowSnapshots.Add(snapshot);
        await _dbContext.SaveChangesAsync();

        var service = CreateSut();

        var result = await service.StartFromSnapshotAsync(caseId, snapshot.Id, lawyerId, CancellationToken.None);

        result.Succeeded.Should().BeTrue($"Status: {result.StatusCode}. Message: {result.Message}");
        result.Data.Should().NotBeNull();

        var restoredWorkflow = await _dbContext.AdminComplaintWorkflows.FindAsync(result.Data!.Id);
        restoredWorkflow.Should().NotBeNull();
        restoredWorkflow!.Status.Should().Be(WorkflowStatus.InProgress);
        restoredWorkflow.RunId.Should().NotBeNullOrWhiteSpace();
        restoredWorkflow.Step1Output.Should().Contain("تظلم إداري");
        restoredWorkflow.Step2Output.Should().Contain("وقائع النسخة السابقة");
        restoredWorkflow.CurrentAccessibleStep.Should().Be(2);
        restoredWorkflow.LastCompletedStep.Should().Be(2);

        var previousWorkflow = await _dbContext.AdminComplaintWorkflows.FindAsync(activeWorkflowId);
        previousWorkflow.Should().NotBeNull();
        previousWorkflow!.Status.Should().Be(WorkflowStatus.Abandoned);

        var snapshots = await _dbContext.WorkflowSnapshots
            .Where(s => s.CaseId == caseId && s.WorkflowType == "admin-complaint")
            .ToListAsync();
        snapshots.Should().ContainSingle();
    }

    [Fact]
    public async Task StartFromSnapshotAsync_ShouldAcceptSnapshotStoredWithLawyerProfileId()
    {
        var caseId = Guid.NewGuid();
        var applicationUserId = Guid.NewGuid();
        var lawyerProfileId = Guid.NewGuid();
        var lawyerId = applicationUserId.ToString();

        if (!await _dbContext.CaseTypes.AnyAsync(x => x.Id == 1))
        {
            _dbContext.CaseTypes.Add(new CaseType { Id = 1, Title = "Administrative Complaint" });
            await _dbContext.SaveChangesAsync();
        }

        _dbContext.Users.Add(new ApplicationUser
        {
            Id = applicationUserId,
            UserName = "lawyer@test.local",
            FullName = "Test Lawyer"
        });
        _dbContext.Set<Lawyer.Core.Models.Lawyer>().Add(new Lawyer.Core.Models.Lawyer
        {
            Id = lawyerProfileId,
            ApplicationUserId = applicationUserId
        });
        _dbContext.Cases.Add(new Case
        {
            Id = caseId,
            CaseTypeId = 1,
            LawyerId = lawyerProfileId,
            Title = "طعن على قرار إداري",
            Number = "123/2026",
            Court = "مجلس الدولة",
            ClientName = "أحمد علي",
            ApponentName = "الجهة الإدارية",
            Description = "قرار إداري ألحق ضررًا مباشرًا بالموكل.",
            Facts = "صدر القرار دون تسبيب كافٍ.",
            LegalClaims = "وقف تنفيذ القرار.",
            Status = CaseStatus.Open
        });
        _dbContext.AdminComplaintWorkflows.Add(new AdminComplaintWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            RowVersion = [1]
        });
        var snapshot = new WorkflowSnapshot
        {
            CaseId = caseId,
            LawyerId = lawyerProfileId.ToString(),
            WorkflowType = "admin-complaint",
            CurrentStep = 1,
            OutputsJson = """
            {
              "1": { "complaintType": "تظلم إداري" }
            }
            """
        };
        _dbContext.WorkflowSnapshots.Add(snapshot);
        await _dbContext.SaveChangesAsync();
        _dbContext.ChangeTracker.Clear();

        var service = CreateSut();

        var result = await service.StartFromSnapshotAsync(caseId, snapshot.Id, lawyerId, CancellationToken.None);

        result.Succeeded.Should().BeTrue($"Status: {result.StatusCode}. Message: {result.Message}");
        result.Data.Should().NotBeNull();
        var restoredWorkflow = await _dbContext.AdminComplaintWorkflows.FindAsync(result.Data!.Id);
        restoredWorkflow.Should().NotBeNull();
        restoredWorkflow!.Step1Output.Should().Contain("تظلم إداري");
    }

    [Fact]
    public async Task StartFromSnapshotAsync_ShouldNotCreateAnotherSnapshotForCompletedCurrentRun()
    {
        var caseId = Guid.NewGuid();
        var lawyerId = Guid.NewGuid().ToString();
        var completedWorkflowId = await SeedWorkflowAsync(caseId, lawyerId);

        var completedWorkflow = await _dbContext.AdminComplaintWorkflows.FindAsync(completedWorkflowId);
        completedWorkflow.Should().NotBeNull();
        completedWorkflow!.Status = WorkflowStatus.Completed;
        completedWorkflow.CurrentStep = 5;
        completedWorkflow.CurrentAccessibleStep = 5;
        completedWorkflow.LastCompletedStep = 5;
        completedWorkflow.Step1Output = """{ "complaintType": "شكوى مكتملة" }""";

        var snapshot = new WorkflowSnapshot
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            WorkflowType = "admin-complaint",
            CurrentStep = 1,
            OutputsJson = """
            {
              "1": { "complaintType": "نسخة سابقة" }
            }
            """
        };
        _dbContext.WorkflowSnapshots.Add(snapshot);
        await _dbContext.SaveChangesAsync();
        _dbContext.ChangeTracker.Clear();

        var service = CreateSut();

        var result = await service.StartFromSnapshotAsync(caseId, snapshot.Id, lawyerId, CancellationToken.None);

        result.Succeeded.Should().BeTrue($"Status: {result.StatusCode}. Message: {result.Message}");
        result.Data.Should().NotBeNull();

        var snapshots = await _dbContext.WorkflowSnapshots
            .Where(s => s.CaseId == caseId && s.WorkflowType == "admin-complaint")
            .ToListAsync();
        snapshots.Should().ContainSingle();

        var originalCompleted = await _dbContext.AdminComplaintWorkflows.FindAsync(completedWorkflowId);
        originalCompleted.Should().NotBeNull();
        originalCompleted!.Status.Should().Be(WorkflowStatus.Completed);
    }

    private AdminComplaintService CreateSut()
    {
        var validatorMock = new Mock<Lawyer.Application.IServices.ICaseAccessValidator>();
        validatorMock.Setup(v => v.ValidateAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Data = true, Succeeded = true, StatusCode = System.Net.HttpStatusCode.OK });

        return new(
            new Lawyer.Infrastructure.Persistence.Repositories.UnitOfWork(_dbContext, new Mock<Microsoft.AspNetCore.Identity.UserManager<Lawyer.Core.Models.ApplicationUser>>(Mock.Of<Microsoft.AspNetCore.Identity.IUserStore<Lawyer.Core.Models.ApplicationUser>>(), null!, null!, null!, null!, null!, null!, null!, null!).Object),
            Mock.Of<ILogger<AdminComplaintService>>(),
            _aiProviderFactory.Object,
            _configuration,
            validatorMock.Object,
            Mock.Of<IAiUsageTrackingService>(),
            new Lawyer.Application.Common.PromptTemplateCache(_configuration[WebHostDefaults.ContentRootKey]!));
    }

    private async Task<int> SeedWorkflowAsync(Guid caseId, string lawyerId)
    {
        if (!await _dbContext.CaseTypes.AnyAsync(x => x.Id == 1))
        {
            _dbContext.CaseTypes.Add(new CaseType { Id = 1, Title = "Administrative Complaint" });
            await _dbContext.SaveChangesAsync();
        }

        _dbContext.Cases.Add(new Case
        {
            Id = caseId,
            CaseTypeId = 1,
            LawyerId = Guid.NewGuid(),
            Title = "طعن على قرار إداري",
            Number = "123/2026",
            Court = "مجلس الدولة",
            ClientName = "أحمد علي",
            ApponentName = "الجهة الإدارية",
            Description = "قرار إداري ألحق ضررًا مباشرًا بالموكل.",
            Facts = "صدر القرار دون تسبيب كافٍ ودون تمكين الموكل من الدفاع.",
            LegalClaims = "وقف تنفيذ القرار ثم إلغاؤه.",
            Status = CaseStatus.Open
        });
        await _dbContext.SaveChangesAsync();

        var workflow = new AdminComplaintWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            RowVersion = [1]
        };

        _dbContext.AdminComplaintWorkflows.Add(workflow);
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
