using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Lawyer.Tests.Services;

public sealed class WorkflowLifecycleTestFixture : IDisposable
{
    public AppDbContext DbContext { get; }

    public WorkflowLifecycleTestFixture()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"WorkflowLifecycleTests-{Guid.NewGuid()}")
            .Options;

        DbContext = new AppDbContext(options);
    }

    public async Task<AiJob> SeedAiJobAsync(
        Guid caseId,
        AiStepType stepType,
        AiJobStatus status = AiJobStatus.Queued,
        string? hangfireJobId = null,
        string? resultJson = null,
        string? errorMessage = null,
        DateTime? startedAt = null,
        DateTime? completedAt = null)
    {
        var c = new Case
        {
            Id = caseId,
            LawyerId = Guid.NewGuid(),
            Title = "Test Case",
            Number = "123",
            Court = "Test Court"
        };
        DbContext.Cases.Add(c);

        var job = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            StepType = stepType,
            Status = status,
            HangfireJobId = hangfireJobId,
            ResultJson = resultJson,
            ErrorMessage = errorMessage,
            StartedAt = startedAt,
            CompletedAt = completedAt
        };

        DbContext.AiJobs.Add(job);
        await DbContext.SaveChangesAsync();
        return job;
    }

    public async Task<AdminComplaintWorkflow> SeedAdminComplaintWorkflowAsync(
        Guid caseId,
        string lawyerId,
        int currentStep = 1,
        WorkflowStatus status = WorkflowStatus.InProgress,
        DateTime? createdAt = null)
    {
        var workflow = new AdminComplaintWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CurrentStep = currentStep,
            Status = status,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            UpdatedAt = createdAt ?? DateTime.UtcNow,
            RowVersion = [1]
        };

        DbContext.AdminComplaintWorkflows.Add(workflow);
        await DbContext.SaveChangesAsync();
        return workflow;
    }

    public async Task<LegalWarningWorkflow> SeedLegalWarningWorkflowAsync(
        Guid caseId,
        string lawyerId,
        int currentStep = 1,
        WorkflowStatus status = WorkflowStatus.InProgress,
        DateTime? createdAt = null)
    {
        var workflow = new LegalWarningWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CurrentStep = currentStep,
            Status = status,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            UpdatedAt = createdAt ?? DateTime.UtcNow,
            RowVersion = [1]
        };

        DbContext.LegalWarningWorkflows.Add(workflow);
        await DbContext.SaveChangesAsync();
        return workflow;
    }

    public async Task<RulingAnalysisWorkflow> SeedRulingAnalysisWorkflowAsync(
        Guid caseId,
        string lawyerId,
        int currentStep = 1,
        WorkflowStatus status = WorkflowStatus.InProgress,
        DateTime? createdAt = null)
    {
        var workflow = new RulingAnalysisWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CurrentStep = currentStep,
            Status = status,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            UpdatedAt = createdAt ?? DateTime.UtcNow,
            RowVersion = [1]
        };

        DbContext.RulingAnalysisWorkflows.Add(workflow);
        await DbContext.SaveChangesAsync();
        return workflow;
    }

    public async Task<ExecRequestWorkflow> SeedExecRequestWorkflowAsync(
        Guid caseId,
        string lawyerId,
        int currentStep = 1,
        WorkflowStatus status = WorkflowStatus.InProgress,
        DateTime? createdAt = null)
    {
        var workflow = new ExecRequestWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CurrentStep = currentStep,
            Status = status,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            UpdatedAt = createdAt ?? DateTime.UtcNow,
            RowVersion = [1]
        };

        DbContext.ExecRequestWorkflows.Add(workflow);
        await DbContext.SaveChangesAsync();
        return workflow;
    }

    public async Task<WorkflowSnapshot> SeedSnapshotAsync(
        Guid caseId,
        string lawyerId,
        string workflowType,
        string outputsJson = "{}",
        int currentStep = 1,
        string? label = null)
    {
        var snapshot = new WorkflowSnapshot
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            WorkflowType = workflowType,
            OutputsJson = outputsJson,
            CurrentStep = currentStep,
            Label = label
        };

        DbContext.WorkflowSnapshots.Add(snapshot);
        await DbContext.SaveChangesAsync();
        return snapshot;
    }

    public void Dispose()
    {
        DbContext.Database.EnsureDeleted();
        DbContext.Dispose();
    }
}
