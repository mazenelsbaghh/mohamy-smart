using Lawyer.Application.IServices;
using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace Lawyer.Tests.Services.AiJobWorker;

public sealed class AiJobWorkerTestFixture : IDisposable
{
    public AppDbContext DbContext { get; }
    public Mock<IFactAnalysisService> FactAnalysisService { get; } = new();
    public Mock<IDefenseService> DefenseService { get; } = new();
    public Mock<ISmartChatService> ChatService { get; } = new();
    public Mock<IPreparingStatementOfClaimsService> PreparingStatementsService { get; } = new();
    public Mock<IAiJobNotificationService> Notifications { get; } = new();
    public Mock<IAdminComplaintService> AdminComplaintService { get; } = new();
    public Mock<ILegalWarningService> LegalWarningService { get; } = new();
    public Mock<IRulingAnalysisService> RulingAnalysisService { get; } = new();
    public Mock<IExecRequestService> ExecRequestService { get; } = new();
    public Mock<ICaseOcrService> CaseOcrService { get; } = new();
    public Mock<ILogger<Lawyer.Application.Services.AiJobWorker>> Logger { get; } = new();

    public AiJobWorkerTestFixture()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"AiJobWorkerTests-{Guid.NewGuid()}")
            .Options;

        DbContext = new AppDbContext(options);

        Notifications.Setup(x => x.NotifyJobStatusChangedAsync(It.IsAny<AiJob>())).Returns(Task.CompletedTask);
        Notifications.Setup(x => x.NotifyJobCompletedAsync(It.IsAny<AiJob>())).Returns(Task.CompletedTask);
        Notifications.Setup(x => x.NotifyJobFailedAsync(It.IsAny<AiJob>())).Returns(Task.CompletedTask);
    }

    public Mock<Lawyer.Application.IServices.IAppealBriefService> AppealBriefService { get; } = new();

    public Lawyer.Application.Services.AiJobWorker CreateSut() => new(
        DbContext,
        FactAnalysisService.Object,
        DefenseService.Object,
        ChatService.Object,
        PreparingStatementsService.Object,
        Notifications.Object,
        AppealBriefService.Object,
        AdminComplaintService.Object,
        LegalWarningService.Object,
        RulingAnalysisService.Object,
        ExecRequestService.Object,
        CaseOcrService.Object,
        Logger.Object);

    public async Task<AiJob> SeedJobAsync(AiStepType stepType, Guid? caseId = null)
    {
        var finalCaseId = caseId ?? Guid.NewGuid();
        
        var job = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = finalCaseId,
            StepType = stepType,
            Status = AiJobStatus.Queued
        };

        var c = new Case { Id = finalCaseId, LawyerId = Guid.NewGuid(), Title = "Test Case", Number = "123", Court = "Test Court" };
        DbContext.Cases.Add(c);

        DbContext.AiJobs.Add(job);
        await DbContext.SaveChangesAsync();
        return job;
    }

    public async Task<AdminComplaintWorkflow> SeedAdminComplaintWorkflowAsync(Guid caseId, string lawyerId, DateTime? createdAt = null)
    {
        var workflow = new AdminComplaintWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            UpdatedAt = createdAt ?? DateTime.UtcNow,
            RowVersion = [1]
        };

        DbContext.AdminComplaintWorkflows.Add(workflow);
        await DbContext.SaveChangesAsync();
        return workflow;
    }

    public async Task<LegalWarningWorkflow> SeedLegalWarningWorkflowAsync(Guid caseId, string lawyerId, DateTime? createdAt = null)
    {
        var workflow = new LegalWarningWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            UpdatedAt = createdAt ?? DateTime.UtcNow,
            RowVersion = [1]
        };

        DbContext.LegalWarningWorkflows.Add(workflow);
        await DbContext.SaveChangesAsync();
        return workflow;
    }

    public async Task<RulingAnalysisWorkflow> SeedRulingAnalysisWorkflowAsync(Guid caseId, string lawyerId, DateTime? createdAt = null)
    {
        var workflow = new RulingAnalysisWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            UpdatedAt = createdAt ?? DateTime.UtcNow,
            RowVersion = [1]
        };

        DbContext.RulingAnalysisWorkflows.Add(workflow);
        await DbContext.SaveChangesAsync();
        return workflow;
    }

    public async Task<ExecRequestWorkflow> SeedExecRequestWorkflowAsync(Guid caseId, string lawyerId, DateTime? createdAt = null)
    {
        var workflow = new ExecRequestWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            UpdatedAt = createdAt ?? DateTime.UtcNow,
            RowVersion = [1]
        };

        DbContext.ExecRequestWorkflows.Add(workflow);
        await DbContext.SaveChangesAsync();
        return workflow;
    }

    public static Result<object> Success(object data) => Result<object>.Success(data);

    public static Result<object> Failure(string message) =>
        Result<object>.Error(System.Net.HttpStatusCode.BadRequest, message);

    public void Dispose()
    {
        DbContext.Database.EnsureDeleted();
        DbContext.Dispose();
    }
}
