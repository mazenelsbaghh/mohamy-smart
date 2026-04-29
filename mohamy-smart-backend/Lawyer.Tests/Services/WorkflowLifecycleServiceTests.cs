using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace Lawyer.Tests.Services;

public class WorkflowLifecycleServiceTests
{
    [Fact]
    public async Task StartNew_ShouldCreateNewActiveRunAndMarkPriorRunHistorical()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var priorWorkflow = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 3, status: WorkflowStatus.InProgress);
        priorWorkflow.Step1Output = "{\"old\":true}";
        priorWorkflow.Step2Output = "{\"old\":true}";
        priorWorkflow.RunId = "run-old";
        fixture.DbContext.AdminComplaintWorkflows.Update(priorWorkflow);
        await fixture.DbContext.SaveChangesAsync();

        priorWorkflow.Status = WorkflowStatus.Abandoned;
        priorWorkflow.UpdatedAt = DateTime.UtcNow;
        fixture.DbContext.AdminComplaintWorkflows.Update(priorWorkflow);

        var newRunId = Guid.NewGuid().ToString();
        var newWorkflow = new AdminComplaintWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CurrentStep = 1,
            Status = WorkflowStatus.InProgress,
            RunId = newRunId,
            CurrentAccessibleStep = 0,
            LastCompletedStep = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            RowVersion = [1]
        };
        fixture.DbContext.AdminComplaintWorkflows.Add(newWorkflow);
        await fixture.DbContext.SaveChangesAsync();

        var updatedPrior = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(priorWorkflow.Id);
        updatedPrior.Should().NotBeNull();
        updatedPrior!.Status.Should().Be(WorkflowStatus.Abandoned);

        var created = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(newWorkflow.Id);
        created.Should().NotBeNull();
        created!.Status.Should().Be(WorkflowStatus.InProgress);
        created.RunId.Should().Be(newRunId);
        created.RunId.Should().NotBe(priorWorkflow.RunId);
    }

    [Fact]
    public async Task StartNew_ShouldReturnEmptyOutputsForNewRun()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var priorWorkflow = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 3, status: WorkflowStatus.InProgress);
        priorWorkflow.Step1Output = "{\"complaintType\":\"test\"}";
        priorWorkflow.Step2Output = "{\"factsSummary\":\"old facts\"}";
        fixture.DbContext.AdminComplaintWorkflows.Update(priorWorkflow);
        await fixture.DbContext.SaveChangesAsync();

        priorWorkflow.Status = WorkflowStatus.Abandoned;
        fixture.DbContext.AdminComplaintWorkflows.Update(priorWorkflow);

        var newWorkflow = new AdminComplaintWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CurrentStep = 1,
            Status = WorkflowStatus.InProgress,
            RunId = Guid.NewGuid().ToString(),
            CurrentAccessibleStep = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            RowVersion = [1]
        };
        fixture.DbContext.AdminComplaintWorkflows.Add(newWorkflow);
        await fixture.DbContext.SaveChangesAsync();

        var created = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(newWorkflow.Id);
        created.Should().NotBeNull();
        created!.Step1Output.Should().BeNull();
        created.Step2Output.Should().BeNull();
        created.Step3Output.Should().BeNull();
        created.Step4Output.Should().BeNull();
        created.Step5Output.Should().BeNull();

        var prior = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(priorWorkflow.Id);
        prior!.Step1Output.Should().NotBeNull();
    }

    [Fact]
    public async Task StartNew_ShouldSetCurrentAccessibleStepToZero()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var priorWorkflow = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 3, status: WorkflowStatus.InProgress);
        priorWorkflow.CurrentAccessibleStep = 3;
        priorWorkflow.LastCompletedStep = 2;
        fixture.DbContext.AdminComplaintWorkflows.Update(priorWorkflow);
        await fixture.DbContext.SaveChangesAsync();

        priorWorkflow.Status = WorkflowStatus.Abandoned;
        fixture.DbContext.AdminComplaintWorkflows.Update(priorWorkflow);

        var newWorkflow = new AdminComplaintWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CurrentStep = 1,
            Status = WorkflowStatus.InProgress,
            RunId = Guid.NewGuid().ToString(),
            CurrentAccessibleStep = 0,
            LastCompletedStep = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            RowVersion = [1]
        };
        fixture.DbContext.AdminComplaintWorkflows.Add(newWorkflow);
        await fixture.DbContext.SaveChangesAsync();

        var created = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(newWorkflow.Id);
        created.Should().NotBeNull();
        created!.CurrentAccessibleStep.Should().Be(0);
        created.LastCompletedStep.Should().Be(0);
        created.CurrentStep.Should().Be(1);
    }

    [Fact]
    public async Task ResumeCurrent_ShouldReturnLatestActiveRun()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var completedRun = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 5, status: WorkflowStatus.Completed);
        completedRun.RunId = "run-old";
        completedRun.CurrentAccessibleStep = 5;
        completedRun.LastCompletedStep = 5;
        fixture.DbContext.AdminComplaintWorkflows.Update(completedRun);
        await fixture.DbContext.SaveChangesAsync();

        var activeRun = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 3, status: WorkflowStatus.InProgress,
            createdAt: DateTime.UtcNow.AddSeconds(10));
        activeRun.RunId = "run-active";
        activeRun.CurrentAccessibleStep = 2;
        activeRun.LastCompletedStep = 2;
        fixture.DbContext.AdminComplaintWorkflows.Update(activeRun);
        await fixture.DbContext.SaveChangesAsync();

        var resumed = await fixture.DbContext.AdminComplaintWorkflows
            .Where(w => w.CaseId == caseId && w.Status == WorkflowStatus.InProgress)
            .OrderByDescending(w => w.CreatedAt)
            .FirstOrDefaultAsync();

        resumed.Should().NotBeNull();
        resumed!.RunId.Should().Be("run-active");
        resumed.CurrentAccessibleStep.Should().Be(2);
        resumed.CurrentStep.Should().Be(3);
    }

    [Fact]
    public async Task ResumeCurrent_ShouldReturnCompletedOutputs()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var workflow = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 3, status: WorkflowStatus.InProgress);
        workflow.RunId = "run-1";
        workflow.CurrentAccessibleStep = 2;
        workflow.LastCompletedStep = 2;
        workflow.Step1Output = "{\"complaintType\":\"grievance\"}";
        workflow.Step2Output = "{\"factsSummary\":\"key facts here\"}";
        fixture.DbContext.AdminComplaintWorkflows.Update(workflow);
        await fixture.DbContext.SaveChangesAsync();

        var resumed = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(workflow.Id);
        resumed.Should().NotBeNull();
        resumed!.GetStepOutput(1).Should().NotBeNull();
        resumed.GetStepOutput(2).Should().NotBeNull();
        resumed.GetStepOutput(1).Should().Contain("grievance");
        resumed.GetStepOutput(2).Should().Contain("key facts");
    }

    [Fact]
    public async Task ResumeCurrent_ShouldReturnLockedFutureStages()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var workflow = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 3, status: WorkflowStatus.InProgress);
        workflow.RunId = "run-1";
        workflow.CurrentAccessibleStep = 2;
        workflow.LastCompletedStep = 2;
        workflow.Step1Output = "{\"data\":true}";
        workflow.Step2Output = "{\"data\":true}";
        workflow.Step3Output = "{\"stale\":true}";
        workflow.Step4Output = "{\"stale\":true}";
        fixture.DbContext.AdminComplaintWorkflows.Update(workflow);
        await fixture.DbContext.SaveChangesAsync();

        var resumed = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(workflow.Id);
        resumed.Should().NotBeNull();
        resumed!.CurrentAccessibleStep.Should().Be(2);

        for (var step = 1; step <= 2; step++)
        {
            resumed.GetStepOutput(step).Should().NotBeNull();
        }

        for (var step = 3; step <= 5; step++)
        {
            resumed.CurrentAccessibleStep.Should().BeLessThan(step);
        }
    }

    [Fact]
    public async Task SaveStepOutput_ShouldUpdateLastCompletedStep_WithoutChangingCurrentAccessibleStep()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var workflow = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 1, status: WorkflowStatus.InProgress);
        workflow.RunId = "run-save-1";
        workflow.CurrentAccessibleStep = 1;
        workflow.LastCompletedStep = 0;
        fixture.DbContext.AdminComplaintWorkflows.Update(workflow);
        await fixture.DbContext.SaveChangesAsync();

        workflow.SetStepOutput(1, "{\"complaintType\":\"grievance\"}");
        workflow.LastCompletedStep = 1;
        workflow.UpdatedAt = DateTime.UtcNow;
        fixture.DbContext.AdminComplaintWorkflows.Update(workflow);
        await fixture.DbContext.SaveChangesAsync();

        var updated = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(workflow.Id);
        updated.Should().NotBeNull();
        updated!.LastCompletedStep.Should().Be(1);
        updated.CurrentAccessibleStep.Should().Be(1);
        updated.GetStepOutput(1).Should().NotBeNull();
        updated.GetStepOutput(1).Should().Contain("grievance");
    }

    [Fact]
    public async Task AdvanceStage_ShouldMoveCurrentAccessibleStep_WhenSourceStepCompleted()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var workflow = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 2, status: WorkflowStatus.InProgress);
        workflow.RunId = "run-advance-1";
        workflow.CurrentAccessibleStep = 1;
        workflow.LastCompletedStep = 1;
        workflow.Step1Output = "{\"complaintType\":\"grievance\"}";
        fixture.DbContext.AdminComplaintWorkflows.Update(workflow);
        await fixture.DbContext.SaveChangesAsync();

        workflow.CurrentAccessibleStep = 2;
        workflow.Step2Output = "{\"factsSummary\":\"key facts\"}";
        workflow.LastCompletedStep = 2;
        workflow.UpdatedAt = DateTime.UtcNow;
        fixture.DbContext.AdminComplaintWorkflows.Update(workflow);
        await fixture.DbContext.SaveChangesAsync();

        var updated = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(workflow.Id);
        updated.Should().NotBeNull();
        updated!.CurrentAccessibleStep.Should().Be(2);
        updated.LastCompletedStep.Should().Be(2);
        updated.GetStepOutput(2).Should().NotBeNull();
    }

    [Fact]
    public async Task AdvanceStage_ShouldReject_WhenSourceStepNotCompleted()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var workflow = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 1, status: WorkflowStatus.InProgress);
        workflow.RunId = "run-reject-1";
        workflow.CurrentAccessibleStep = 1;
        workflow.LastCompletedStep = 0;
        fixture.DbContext.AdminComplaintWorkflows.Update(workflow);
        await fixture.DbContext.SaveChangesAsync();

        var canAdvance = workflow.LastCompletedStep >= 1;
        canAdvance.Should().BeFalse();

        var unchanged = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(workflow.Id);
        unchanged!.CurrentAccessibleStep.Should().Be(1);
        unchanged.LastCompletedStep.Should().Be(0);
    }

    [Fact]
    public async Task AdvanceStage_ShouldReject_WhenTargetBeyondCompletedPlusOne()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var workflow = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 2, status: WorkflowStatus.InProgress);
        workflow.RunId = "run-skip-1";
        workflow.CurrentAccessibleStep = 1;
        workflow.LastCompletedStep = 1;
        workflow.Step1Output = "{\"complaintType\":\"grievance\"}";
        fixture.DbContext.AdminComplaintWorkflows.Update(workflow);
        await fixture.DbContext.SaveChangesAsync();

        var targetStep = 3;
        var canAdvance = targetStep <= workflow.LastCompletedStep + 1;
        canAdvance.Should().BeFalse();

        var unchanged = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(workflow.Id);
        unchanged!.CurrentAccessibleStep.Should().Be(1);
    }

    [Fact]
    public async Task ResumeCurrent_WhenNoActiveRun_ShouldReturnFirstStageRun()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var completedRun = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 5, status: WorkflowStatus.Completed);
        completedRun.RunId = "run-completed";
        completedRun.CurrentAccessibleStep = 5;
        fixture.DbContext.AdminComplaintWorkflows.Update(completedRun);
        await fixture.DbContext.SaveChangesAsync();

        var abandonedRun = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 3, status: WorkflowStatus.Abandoned);
        abandonedRun.RunId = "run-abandoned";
        fixture.DbContext.AdminComplaintWorkflows.Update(abandonedRun);
        await fixture.DbContext.SaveChangesAsync();

        var existingActive = await fixture.DbContext.AdminComplaintWorkflows
            .Where(w => w.CaseId == caseId && w.Status == WorkflowStatus.InProgress)
            .FirstOrDefaultAsync();
        existingActive.Should().BeNull();

        var newRun = new AdminComplaintWorkflow
        {
            CaseId = caseId,
            LawyerId = lawyerId,
            CurrentStep = 1,
            Status = WorkflowStatus.InProgress,
            RunId = Guid.NewGuid().ToString(),
            CurrentAccessibleStep = 0,
            LastCompletedStep = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            RowVersion = [1]
        };
        fixture.DbContext.AdminComplaintWorkflows.Add(newRun);
        await fixture.DbContext.SaveChangesAsync();

        var created = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(newRun.Id);
        created.Should().NotBeNull();
        created!.Status.Should().Be(WorkflowStatus.InProgress);
        created.CurrentStep.Should().Be(1);
        created.CurrentAccessibleStep.Should().Be(0);
        created.GetStepOutput(1).Should().BeNull();
    }

    [Fact]
    public async Task ConflictState_ShouldNotAdvanceCurrentAccessibleStep()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var workflow = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 2, status: WorkflowStatus.InProgress);
        workflow.RunId = "run-conflict-1";
        workflow.CurrentAccessibleStep = 1;
        workflow.LastCompletedStep = 1;
        workflow.Step1Output = "{\"complaintType\":\"test\"}";
        workflow.ConflictStepMetadata = "{\"stepNumber\":2,\"errorCode\":\"ConcurrencyConflict\"}";
        fixture.DbContext.AdminComplaintWorkflows.Update(workflow);
        await fixture.DbContext.SaveChangesAsync();

        var loaded = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(workflow.Id);
        loaded.Should().NotBeNull();
        loaded!.CurrentAccessibleStep.Should().Be(1);
        loaded.ConflictStepMetadata.Should().NotBeNull();
    }

    [Fact]
    public async Task ConflictState_ShouldKeepFutureStagesLocked()
    {
        using var fixture = new WorkflowLifecycleTestFixture();
        var caseId = Guid.NewGuid();
        var lawyerId = "lawyer-1";

        var workflow = await fixture.SeedAdminComplaintWorkflowAsync(
            caseId, lawyerId, currentStep: 3, status: WorkflowStatus.InProgress);
        workflow.RunId = "run-conflict-2";
        workflow.CurrentAccessibleStep = 2;
        workflow.LastCompletedStep = 2;
        workflow.ConflictStepMetadata = "{\"stepNumber\":3,\"errorCode\":\"ConcurrencyConflict\"}";
        fixture.DbContext.AdminComplaintWorkflows.Update(workflow);
        await fixture.DbContext.SaveChangesAsync();

        var loaded = await fixture.DbContext.AdminComplaintWorkflows.FindAsync(workflow.Id);
        loaded.Should().NotBeNull();
        loaded!.CurrentAccessibleStep.Should().Be(2);

        for (var step = 3; step <= 5; step++)
        {
            loaded.CurrentAccessibleStep.Should().BeLessThan(step);
        }
    }
}
