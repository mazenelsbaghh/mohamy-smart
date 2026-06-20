using System.Reflection;
using FluentAssertions;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using Lawyer.Application.Dtos.AiJobs;
using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Application.IServices;
using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Moq;
using Xunit;

namespace Lawyer.Tests.Services;

public class AiJobServiceTests
{
    private readonly DbContextOptions<AppDbContext> _dbOptions;

    public AiJobServiceTests()
    {
        _dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
    }

    [Fact]
    public void IsDuplicateActiveJobViolation_ShouldReturnTrue_ForSqlError2601()
    {
        // Arrange
        var sqlExceptionStub = new SqlExceptionStub(2601);
        var dbUpdateException = new DbUpdateException("Error", sqlExceptionStub);

        var method = typeof(AiJobService).GetMethod("IsDuplicateActiveJobViolation", BindingFlags.Static | BindingFlags.NonPublic);
        method.Should().NotBeNull();

        // Act
        var result = (bool)method!.Invoke(null, [dbUpdateException])!;

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsDuplicateActiveJobViolation_ShouldReturnTrue_ForSqlError2627()
    {
        // Arrange
        var sqlExceptionStub = new SqlExceptionStub(2627);
        var dbUpdateException = new DbUpdateException("Error", sqlExceptionStub);

        var method = typeof(AiJobService).GetMethod("IsDuplicateActiveJobViolation", BindingFlags.Static | BindingFlags.NonPublic);
        method.Should().NotBeNull();

        // Act
        var result = (bool)method!.Invoke(null, [dbUpdateException])!;

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task GetActiveJobAsync_ShouldReturnLatestJob_WhenMultipleActiveJobsExist()
    {
        // Arrange
        await using var db = new AppDbContext(_dbOptions);
        var caseId = Guid.NewGuid();
        var stepType = AiStepType.FactAnalysis;

        var olderJob = new AiJob 
        { 
            Id = Guid.NewGuid(), 
            CaseId = caseId, 
            StepType = stepType, 
            Status = AiJobStatus.Processing, 
            CreatedAt = DateTime.UtcNow.AddMinutes(-10) 
        };
        var newerJob = new AiJob 
        { 
            Id = Guid.NewGuid(), 
            CaseId = caseId, 
            StepType = stepType, 
            Status = AiJobStatus.Processing, 
            CreatedAt = DateTime.UtcNow 
        };

        db.AiJobs.Add(olderJob);
        db.AiJobs.Add(newerJob);
        await db.SaveChangesAsync();

        var hangfireMock = new Mock<IBackgroundJobClient>();
        var notificationsMock = new Mock<IAiJobNotificationService>();
        var accessMock = new Mock<ICaseAccessValidator>();
        accessMock.Setup(x => x.ValidateAsync(caseId, "user123", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Succeeded = true, Data = true, StatusCode = System.Net.HttpStatusCode.OK });

        var sut = new AiJobService(db, hangfireMock.Object, notificationsMock.Object, accessMock.Object);

        var dto = new SubmitAiJobDto(stepType, "{}", null, null, null);

        // Act
        // SubmitAsync calls GetActiveJobAsync and returns it if found.
        var result = await sut.SubmitAsync(caseId, dto, "user123", CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(newerJob.Id); // Ensures the newer job was fetched
    }

    [Fact]
    public async Task GetAllByCaseAsync_ShouldProjectJobsAfterMaterialization()
    {
        await using var db = new AppDbContext(_dbOptions);
        var caseId = Guid.NewGuid();

        db.AiJobs.AddRange(
            new AiJob
            {
                Id = Guid.NewGuid(),
                CaseId = caseId,
                StepType = AiStepType.FactAnalysis,
                Status = AiJobStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddMinutes(-2)
            },
            new AiJob
            {
                Id = Guid.NewGuid(),
                CaseId = caseId,
                StepType = AiStepType.FinalRequirements,
                Status = AiJobStatus.Processing,
                CreatedAt = DateTime.UtcNow
            });
        await db.SaveChangesAsync();

        var hangfireMock = new Mock<IBackgroundJobClient>();
        var notificationsMock = new Mock<IAiJobNotificationService>();
        var accessMock = new Mock<ICaseAccessValidator>();
        accessMock.Setup(x => x.ValidateAsync(caseId, "user123", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Succeeded = true, Data = true, StatusCode = System.Net.HttpStatusCode.OK });

        var sut = new AiJobService(db, hangfireMock.Object, notificationsMock.Object, accessMock.Object);

        var result = await sut.GetAllByCaseAsync(caseId, "user123", null, null, null, true, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().HaveCount(2);
        result.Data!.Select(x => x.StepType).Should().ContainInOrder(AiStepType.FactAnalysis, AiStepType.FinalRequirements);
    }

    [Fact]
    public async Task SubmitAsync_ShouldCreateNewAttempt_WhenPreviousJobCompleted()
    {
        // Arrange
        await using var db = new AppDbContext(_dbOptions);
        var caseId = Guid.NewGuid();
        var lawyerId = Guid.NewGuid();
        var stepType = AiStepType.LegalWarningClassification;
        var originalCreatedAt = DateTime.UtcNow.AddHours(-2);

        db.Subscriptions.Add(new Subscription
        {
            Id = 1,
            Name = "Test",
            AiRequestsLimit = 10,
            DurationDays = 30
        });
        db.LawyerSubscriptions.Add(new LawyerSubscription
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            SubscriptionId = 1,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(30),
            UsedAiRequests = 0
        });
        db.Cases.Add(new Case
        {
            Id = caseId,
            LawyerId = lawyerId,
            Title = "Test Case",
            Number = "123",
            Court = "Test Court"
        });

        var completedJob = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            StepType = stepType,
            Status = AiJobStatus.Completed,
            ResultJson = "{\"old\":true}",
            CompletedAt = DateTime.UtcNow.AddHours(-1),
            HangfireJobId = "old-hangfire-id",
            CreatedAt = originalCreatedAt
        };

        db.AiJobs.Add(completedJob);
        await db.SaveChangesAsync();

        var hangfireMock = new Mock<IBackgroundJobClient>();
        hangfireMock
            .Setup(x => x.Create(It.IsAny<Job>(), It.IsAny<IState>()))
            .Returns("new-hangfire-id");
        var notificationsMock = new Mock<IAiJobNotificationService>();
        var accessMock = new Mock<ICaseAccessValidator>();
        accessMock.Setup(x => x.ValidateAsync(caseId, "user123", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Succeeded = true, Data = true, StatusCode = System.Net.HttpStatusCode.OK });

        var sut = new AiJobService(db, hangfireMock.Object, notificationsMock.Object, accessMock.Object);

        // Act
        var result = await sut.SubmitAsync(caseId, new SubmitAiJobDto(stepType, "{}", null, null, null), "user123", CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().NotBe(completedJob.Id);
        result.Data.Status.Should().Be(AiJobStatus.Queued);
        result.Data.CreatedAt.Should().BeAfter(originalCreatedAt);
        result.Data.CompletedAt.Should().BeNull();
        result.Data.ResultJson.Should().BeNull();

        var persistedCompletedJob = await db.AiJobs.FindAsync(completedJob.Id);
        persistedCompletedJob!.Status.Should().Be(AiJobStatus.Completed);
        persistedCompletedJob.ResultJson.Should().Be("{\"old\":true}");

        var persistedNewAttempt = await db.AiJobs.FindAsync(result.Data.Id);
        persistedNewAttempt!.HangfireJobId.Should().Be("new-hangfire-id");
    }

    [Fact]
    public async Task SubmitAsync_ProductionRegression20260619_ShouldNotReuseFailedJob()
    {
        await using var db = new AppDbContext(_dbOptions);
        var caseId = Guid.NewGuid();
        var lawyerId = Guid.NewGuid();

        db.Subscriptions.Add(new Subscription
        {
            Id = 1,
            Name = "Test",
            AiRequestsLimit = 10,
            DurationDays = 30
        });
        db.LawyerSubscriptions.Add(new LawyerSubscription
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            SubscriptionId = 1,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(30)
        });
        db.Cases.Add(new Case
        {
            Id = caseId,
            LawyerId = lawyerId,
            Title = "Test Case",
            Number = "123",
            Court = "Test Court"
        });

        var failedJob = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            StepType = AiStepType.DefenseMemoDraft,
            Status = AiJobStatus.Failed,
            ErrorMessage = "AI provider failed",
            CompletedAt = DateTime.UtcNow.AddMinutes(-1),
            HangfireJobId = "scheduled-retry",
            CreatedAt = DateTime.UtcNow.AddMinutes(-5)
        };
        failedJob.ResultJson = System.Text.Json.JsonSerializer.Serialize(
            new DefenseMemoDraftCheckpointDto
            {
                InputFingerprint = "same-input",
                Frame = new DefenseMemoFrameSectionsDto { OpeningHtml = "<p>saved frame</p>" }
            },
            Lawyer.Application.Common.JsonOptions.Serialize);
        db.AiJobs.Add(failedJob);
        await db.SaveChangesAsync();

        var hangfireMock = new Mock<IBackgroundJobClient>();
        hangfireMock
            .Setup(x => x.Create(It.IsAny<Job>(), It.IsAny<IState>()))
            .Returns("new-hangfire-id");
        hangfireMock
            .Setup(x => x.ChangeState("scheduled-retry", It.IsAny<DeletedState>(), null))
            .Returns(true);
        var notificationsMock = new Mock<IAiJobNotificationService>();
        var accessMock = new Mock<ICaseAccessValidator>();
        accessMock.Setup(x => x.ValidateAsync(caseId, "user123", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool>
            {
                Succeeded = true,
                Data = true,
                StatusCode = System.Net.HttpStatusCode.OK
            });

        var sut = new AiJobService(db, hangfireMock.Object, notificationsMock.Object, accessMock.Object);

        var submission = await sut.SubmitAsync(
            caseId,
            new SubmitAiJobDto(
                AiStepType.DefenseMemoDraft,
                "{}",
                null,
                null,
                null,
                AiRepeatIntent.RetryAfterFailure,
                DateTime.UtcNow),
            "user123",
            CancellationToken.None);

        submission.Succeeded.Should().BeTrue();
        submission.Data!.Id.Should().NotBe(failedJob.Id);

        var persistedFailedJob = await db.AiJobs.FindAsync(failedJob.Id);
        persistedFailedJob!.Status.Should().Be(AiJobStatus.Failed);
        persistedFailedJob.ErrorMessage.Should().Be("AI provider failed");
        var persistedNewAttempt = await db.AiJobs.SingleAsync(job => job.Id == submission.Data.Id);
        persistedNewAttempt.ResultJson.Should().Be(failedJob.ResultJson);
        (await db.AiJobs.CountAsync(job => job.CaseId == caseId)).Should().Be(2);
        hangfireMock.Verify(
            client => client.ChangeState("scheduled-retry", It.IsAny<DeletedState>(), null),
            Times.Once);
    }

    [Fact]
    public async Task IgnoreStaleCompletion_OldRunJob_ShouldNotUpdateNewerRun()
    {
        await using var db = new AppDbContext(_dbOptions);
        var caseId = Guid.NewGuid();
        var lawyerId = Guid.NewGuid();
        var oldRunId = "run-old";
        var newRunId = "run-new";

        var oldCase = new Case
        {
            Id = caseId,
            LawyerId = lawyerId,
            Title = "Test Case",
            Number = "123",
            Court = "Test Court"
        };
        db.Cases.Add(oldCase);
        db.Subscriptions.Add(new Subscription
        {
            Id = 1,
            Name = "Test",
            AiRequestsLimit = 10,
            DurationDays = 30
        });
        db.LawyerSubscriptions.Add(new LawyerSubscription
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            SubscriptionId = 1,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(30),
            UsedAiRequests = 0
        });

        var staleJob = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            StepType = AiStepType.FactAnalysis,
            Status = AiJobStatus.Processing,
            RunId = oldRunId,
            WorkflowType = "SmartAnalysis",
            StepNumber = 1,
        };
        db.AiJobs.Add(staleJob);

        var newJob = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            StepType = AiStepType.FactAnalysis,
            Status = AiJobStatus.Processing,
            RunId = newRunId,
            WorkflowType = "SmartAnalysis",
            StepNumber = 1,
        };
        db.AiJobs.Add(newJob);
        await db.SaveChangesAsync();

        var hangfireMock = new Mock<IBackgroundJobClient>();
        var notificationsMock = new Mock<IAiJobNotificationService>();
        var accessMock = new Mock<ICaseAccessValidator>();
        accessMock.Setup(x => x.ValidateAsync(caseId, "user123", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Succeeded = true, Data = true, StatusCode = System.Net.HttpStatusCode.OK });

        var sut = new AiJobService(db, hangfireMock.Object, notificationsMock.Object, accessMock.Object);

        var result = await sut.IgnoreStaleCompletionAsync(staleJob.Id, newRunId, "user123", CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().BeTrue();

        var persistedStale = await db.AiJobs.FindAsync(staleJob.Id);
        persistedStale!.Status.Should().Be(AiJobStatus.Failed);
        persistedStale.ErrorCode.Should().Be("StaleIgnored");
        persistedStale.ChargeState.Should().Be(AiChargeState.NoCharge);
        persistedStale.HangfireJobId.Should().BeNull();

        var persistedNew = await db.AiJobs.FindAsync(newJob.Id);
        persistedNew!.Status.Should().Be(AiJobStatus.Processing);
    }

    [Fact]
    public async Task Submit_DuplicateForSameRunAndStep_ShouldReturnExistingJob()
    {
        await using var db = new AppDbContext(_dbOptions);
        var caseId = Guid.NewGuid();
        var runId = "run-1";
        var workflowType = "SmartAnalysis";
        var stepNumber = 1;
        var stepType = AiStepType.FactAnalysis;

        var oldCase = new Case
        {
            Id = caseId,
            LawyerId = Guid.NewGuid(),
            Title = "Test Case",
            Number = "123",
            Court = "Test Court"
        };
        db.Cases.Add(oldCase);

        var existingJob = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            StepType = stepType,
            Status = AiJobStatus.Queued,
            RunId = runId,
            WorkflowType = workflowType,
            StepNumber = stepNumber,
        };
        db.AiJobs.Add(existingJob);
        await db.SaveChangesAsync();

        var hangfireMock = new Mock<IBackgroundJobClient>();
        var notificationsMock = new Mock<IAiJobNotificationService>();
        var accessMock = new Mock<ICaseAccessValidator>();
        accessMock.Setup(x => x.ValidateAsync(caseId, "user123", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Succeeded = true, Data = true, StatusCode = System.Net.HttpStatusCode.OK });

        var sut = new AiJobService(db, hangfireMock.Object, notificationsMock.Object, accessMock.Object);

        var dto = new SubmitAiJobDto(stepType, "{}", runId, workflowType, stepNumber);
        var result = await sut.SubmitAsync(caseId, dto, "user123", CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(existingJob.Id);

        hangfireMock.Verify(x => x.Create(It.IsAny<Hangfire.Common.Job>(), It.IsAny<Hangfire.States.IState>()), Times.Never);
    }

    [Fact]
    public async Task GetActiveJobByRun_ShouldReturnQueuedJobForMatchingRun()
    {
        await using var db = new AppDbContext(_dbOptions);
        var caseId = Guid.NewGuid();
        var runId = "run-queued";
        var workflowType = "SmartAnalysis";
        var stepNumber = 1;
        var stepType = AiStepType.FactAnalysis;

        var c = new Case
        {
            Id = caseId,
            LawyerId = Guid.NewGuid(),
            Title = "Test Case",
            Number = "123",
            Court = "Test Court"
        };
        db.Cases.Add(c);

        var job = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            StepType = stepType,
            Status = AiJobStatus.Queued,
            RunId = runId,
            WorkflowType = workflowType,
            StepNumber = stepNumber,
        };
        db.AiJobs.Add(job);
        await db.SaveChangesAsync();

        var hangfireMock = new Mock<IBackgroundJobClient>();
        var notificationsMock = new Mock<IAiJobNotificationService>();
        var accessMock = new Mock<ICaseAccessValidator>();
        accessMock.Setup(x => x.ValidateAsync(caseId, "user123", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Succeeded = true, Data = true, StatusCode = System.Net.HttpStatusCode.OK });

        var sut = new AiJobService(db, hangfireMock.Object, notificationsMock.Object, accessMock.Object);

        var result = await sut.GetActiveJobByRunAsync(caseId, runId, workflowType, stepNumber, "user123", CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(job.Id);
        result.Data.Status.Should().Be(AiJobStatus.Queued);
        result.Data.RunId.Should().Be(runId);
        result.Data.StepNumber.Should().Be(stepNumber);
    }

    [Fact]
    public async Task GetActiveJobByRun_ShouldReturnProcessingJobForMatchingRun()
    {
        await using var db = new AppDbContext(_dbOptions);
        var caseId = Guid.NewGuid();
        var runId = "run-processing";
        var workflowType = "SmartAnalysis";
        var stepNumber = 2;
        var stepType = AiStepType.FactAnalysis;

        var c = new Case
        {
            Id = caseId,
            LawyerId = Guid.NewGuid(),
            Title = "Test Case",
            Number = "123",
            Court = "Test Court"
        };
        db.Cases.Add(c);

        var job = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            StepType = stepType,
            Status = AiJobStatus.Processing,
            RunId = runId,
            WorkflowType = workflowType,
            StepNumber = stepNumber,
        };
        db.AiJobs.Add(job);
        await db.SaveChangesAsync();

        var hangfireMock = new Mock<IBackgroundJobClient>();
        var notificationsMock = new Mock<IAiJobNotificationService>();
        var accessMock = new Mock<ICaseAccessValidator>();
        accessMock.Setup(x => x.ValidateAsync(caseId, "user123", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Succeeded = true, Data = true, StatusCode = System.Net.HttpStatusCode.OK });

        var sut = new AiJobService(db, hangfireMock.Object, notificationsMock.Object, accessMock.Object);

        var result = await sut.GetActiveJobByRunAsync(caseId, runId, workflowType, stepNumber, "user123", CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(job.Id);
        result.Data.Status.Should().Be(AiJobStatus.Processing);
        result.Data.RunId.Should().Be(runId);
        result.Data.StepNumber.Should().Be(stepNumber);
    }

    [Fact]
    public async Task GetActiveJobByRun_ShouldReturnNullWhenNoActiveJobForRun()
    {
        await using var db = new AppDbContext(_dbOptions);
        var caseId = Guid.NewGuid();
        var runId = "run-missing";
        var workflowType = "SmartAnalysis";
        var stepNumber = 1;

        var c = new Case
        {
            Id = caseId,
            LawyerId = Guid.NewGuid(),
            Title = "Test Case",
            Number = "123",
            Court = "Test Court"
        };
        db.Cases.Add(c);

        var completedJob = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            StepType = AiStepType.FactAnalysis,
            Status = AiJobStatus.Completed,
            RunId = runId,
            WorkflowType = workflowType,
            StepNumber = stepNumber,
        };
        db.AiJobs.Add(completedJob);
        await db.SaveChangesAsync();

        var hangfireMock = new Mock<IBackgroundJobClient>();
        var notificationsMock = new Mock<IAiJobNotificationService>();
        var accessMock = new Mock<ICaseAccessValidator>();
        accessMock.Setup(x => x.ValidateAsync(caseId, "user123", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Succeeded = true, Data = true, StatusCode = System.Net.HttpStatusCode.OK });

        var sut = new AiJobService(db, hangfireMock.Object, notificationsMock.Object, accessMock.Object);

        var result = await sut.GetActiveJobByRunAsync(caseId, runId, workflowType, stepNumber, "user123", CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().BeNull();
    }

    [Fact]
    public async Task SubmitAsync_ShouldAlwaysCreateNewAttempt_WhenStepTypeIsAnalysisDefense()
    {
        // Arrange
        await using var db = new AppDbContext(_dbOptions);
        var caseId = Guid.NewGuid();
        var lawyerId = Guid.NewGuid();
        var stepType = AiStepType.AnalysisDefense;

        db.Subscriptions.Add(new Subscription
        {
            Id = 1,
            Name = "Test",
            AiRequestsLimit = 10,
            DurationDays = 30
        });
        db.LawyerSubscriptions.Add(new LawyerSubscription
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            SubscriptionId = 1,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(30),
            UsedAiRequests = 0
        });
        db.Cases.Add(new Case
        {
            Id = caseId,
            LawyerId = lawyerId,
            Title = "Test Case",
            Number = "123",
            Court = "Test Court"
        });

        var completedJob = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            StepType = stepType,
            Status = AiJobStatus.Completed,
            ResultJson = "{\"old\":true}",
            CompletedAt = DateTime.UtcNow.AddHours(-1),
            HangfireJobId = "old-hangfire-id",
            CreatedAt = DateTime.UtcNow.AddHours(-2)
        };

        db.AiJobs.Add(completedJob);
        await db.SaveChangesAsync();

        var hangfireMock = new Mock<IBackgroundJobClient>();
        hangfireMock
            .Setup(x => x.Create(It.IsAny<Job>(), It.IsAny<IState>()))
            .Returns("new-hangfire-id");

        var notificationsMock = new Mock<IAiJobNotificationService>();
        var accessMock = new Mock<ICaseAccessValidator>();
        accessMock.Setup(x => x.ValidateAsync(caseId, "user123", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Succeeded = true, Data = true, StatusCode = System.Net.HttpStatusCode.OK });

        var sut = new AiJobService(db, hangfireMock.Object, notificationsMock.Object, accessMock.Object);

        // Act
        var result = await sut.SubmitAsync(caseId, new SubmitAiJobDto(stepType, "{}", null, null, null), "user123", CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().NotBe(completedJob.Id); // Verify it did NOT reuse the old job ID
        result.Data.Status.Should().Be(AiJobStatus.Queued);
        result.Data.CompletedAt.Should().BeNull();

        var allJobs = await db.AiJobs.Where(j => j.CaseId == caseId && j.StepType == stepType).ToListAsync();
        allJobs.Should().HaveCount(2); // Verify we now have 2 jobs in the database (old one completed, new one queued)
    }


    private class SqlExceptionStub : Exception
    {
        public int Number { get; }
        public SqlExceptionStub(int number) : base("Simulated SQL Exception")
        {
            Number = number;
        }
    }
}
