using FluentAssertions;
using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Lawyer.Tests.Services;

public class AiPointAccountingServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly AiPointAccountingService _sut;

    public AiPointAccountingServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"AiPointAccountingServiceTests-{Guid.NewGuid()}")
            .Options;

        _dbContext = new AppDbContext(options);
        _sut = new AiPointAccountingService(_dbContext);
    }

    [Fact]
    public async Task GetCurrentBalanceAsync_ShouldResetUsedPointsToZero_IfGreaterThanZero()
    {
        // Arrange
        var lawyerId = Guid.NewGuid();
        var subscription = new Subscription
        {
            Id = 1,
            Name = "تجريبية",
            AiRequestsLimit = 111,
            DurationDays = 30
        };
        var lawyerSubscription = new LawyerSubscription
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            SubscriptionId = 1,
            Subscription = subscription,
            UsedAiRequests = 82, // 29 / 111 available
            StartDate = DateTime.UtcNow.AddDays(-5),
            EndDate = DateTime.UtcNow.AddDays(25),
            IsActive = true
        };

        _dbContext.Subscriptions.Add(subscription);
        _dbContext.LawyerSubscriptions.Add(lawyerSubscription);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _sut.GetCurrentBalanceAsync(lawyerId, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Available.Should().Be(111); // Renewed to 111
        result.Data.Used.Should().Be(0);

        // Verify database updated
        var dbSub = await _dbContext.LawyerSubscriptions.FirstAsync(s => s.LawyerId == lawyerId);
        dbSub.UsedAiRequests.Should().Be(0);
    }

    [Fact]
    public async Task ChargeSuccessfulDirectActionAsync_ShouldResetUsedPointsToZero_IfLimitExceeded()
    {
        // Arrange
        var lawyerId = Guid.NewGuid();
        var subscription = new Subscription
        {
            Id = 1,
            Name = "تجريبية",
            AiRequestsLimit = 111,
            DurationDays = 30
        };
        var lawyerSubscription = new LawyerSubscription
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            SubscriptionId = 1,
            Subscription = subscription,
            UsedAiRequests = 110, // only 1 left
            StartDate = DateTime.UtcNow.AddDays(-5),
            EndDate = DateTime.UtcNow.AddDays(25),
            IsActive = true
        };

        _dbContext.Subscriptions.Add(subscription);
        _dbContext.LawyerSubscriptions.Add(lawyerSubscription);
        await _dbContext.SaveChangesAsync();

        // Act - charge 5 points (would exceed 111)
        var result = await _sut.ChargeSuccessfulDirectActionAsync(
            lawyerId,
            AiStepType.FactAnalysis,
            5,
            Guid.NewGuid(),
            "SmartAnalysis",
            Guid.NewGuid().ToString(),
            "خصم تجريبي",
            CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data!.Available.Should().Be(106); // 111 - 5 = 106
        result.Data.Used.Should().Be(5);

        var dbSub = await _dbContext.LawyerSubscriptions.FirstAsync(s => s.LawyerId == lawyerId);
        dbSub.UsedAiRequests.Should().Be(5);
    }

    [Fact]
    public async Task RecordNoChargeDirectActionAsync_ShouldWriteNoChargeTransactionWithoutChangingUsedPoints()
    {
        var lawyerId = Guid.NewGuid();
        var subscription = new Subscription
        {
            Id = 101,
            Name = "تجريبية",
            AiRequestsLimit = 111,
            DurationDays = 30
        };
        var lawyerSubscription = new LawyerSubscription
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            SubscriptionId = subscription.Id,
            Subscription = subscription,
            UsedAiRequests = 7,
            StartDate = DateTime.UtcNow.AddDays(-5),
            EndDate = DateTime.UtcNow.AddDays(25),
            IsActive = true
        };

        _dbContext.Subscriptions.Add(subscription);
        _dbContext.LawyerSubscriptions.Add(lawyerSubscription);
        await _dbContext.SaveChangesAsync();

        var result = await _sut.RecordNoChargeDirectActionAsync(
            lawyerId,
            AiStepType.Chat,
            null,
            "SmartChat",
            Guid.NewGuid().ToString(),
            "رسالة مجانية",
            CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        var dbSub = await _dbContext.LawyerSubscriptions.FirstAsync(s => s.LawyerId == lawyerId);
        dbSub.UsedAiRequests.Should().Be(7);

        var transaction = await _dbContext.AiPointTransactions.SingleAsync(t => t.LawyerId == lawyerId);
        transaction.StepType.Should().Be(AiStepType.Chat);
        transaction.TransactionType.Should().Be(AiPointTransactionType.NoCharge);
        transaction.Points.Should().Be(0);
        transaction.BalanceBefore.Should().Be(7);
        transaction.BalanceAfter.Should().Be(7);
    }

    [Fact]
    public async Task ChargeSuccessfulJobAsync_ShouldResetUsedPointsToZero_IfLimitExceeded()
    {
        // Arrange
        var lawyerId = Guid.NewGuid();
        var subscription = new Subscription
        {
            Id = 1,
            Name = "تجريبية",
            AiRequestsLimit = 111,
            DurationDays = 30
        };
        var lawyerSubscription = new LawyerSubscription
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            SubscriptionId = 1,
            Subscription = subscription,
            UsedAiRequests = 110, // only 1 left
            StartDate = DateTime.UtcNow.AddDays(-5),
            EndDate = DateTime.UtcNow.AddDays(25),
            IsActive = true
        };

        var job = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = Guid.NewGuid(),
            RunId = Guid.NewGuid().ToString(),
            WorkflowType = "SmartAnalysis",
            StepType = AiStepType.FactAnalysis,
            PointCost = 5,
            ChargeState = AiChargeState.Pending
        };

        _dbContext.Subscriptions.Add(subscription);
        _dbContext.LawyerSubscriptions.Add(lawyerSubscription);
        _dbContext.AiJobs.Add(job);
        await _dbContext.SaveChangesAsync();

        // Act - charge 5 points for the job
        var result = await _sut.ChargeSuccessfulJobAsync(job, lawyerId, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data!.Balance.Should().NotBeNull();
        result.Data!.Balance!.Available.Should().Be(106); // 111 - 5 = 106
        result.Data.Balance.Used.Should().Be(5);

        var dbSub = await _dbContext.LawyerSubscriptions.FirstAsync(s => s.LawyerId == lawyerId);
        dbSub.UsedAiRequests.Should().Be(5);
    }

    [Fact]
    public async Task ValidateCanStartAsync_ShouldReturnSuccessWithCostZero_WhenRunAlreadyCharged()
    {
        // Arrange
        var lawyerId = Guid.NewGuid();
        var subscription = new Subscription
        {
            Id = 1,
            Name = "تجريبية",
            AiRequestsLimit = 111,
            DurationDays = 30
        };
        var lawyerSubscription = new LawyerSubscription
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            SubscriptionId = 1,
            Subscription = subscription,
            UsedAiRequests = 111, // 0 points remaining!
            StartDate = DateTime.UtcNow.AddDays(-5),
            EndDate = DateTime.UtcNow.AddDays(25),
            IsActive = true
        };

        var runId = "test-run-123";

        // Add a previous charge transaction for this RunId
        var chargeTx = new AiPointTransaction
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            LawyerSubscriptionId = lawyerSubscription.Id,
            WorkflowRunId = runId,
            TransactionType = AiPointTransactionType.Charge,
            Points = 1,
            ReasonCode = AiPointReasonCode.Success,
            MessageAr = "Already charged"
        };

        _dbContext.Subscriptions.Add(subscription);
        _dbContext.LawyerSubscriptions.Add(lawyerSubscription);
        _dbContext.AiPointTransactions.Add(chargeTx);
        await _dbContext.SaveChangesAsync();

        // Act - Validate for a step that normally costs 1 point, but with runId
        var result = await _sut.ValidateCanStartAsync(lawyerId, AiStepType.FactAnalysis, runId, "SmartAnalysis", CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue(); // Should succeed even though Available is 0 points because cost becomes 0
        result.Data.Should().NotBeNull();
        result.Data!.Available.Should().Be(111);
    }

    [Fact]
    public async Task ChargeSuccessfulJobAsync_ShouldNotChargePoints_WhenRunAlreadyCharged()
    {
        // Arrange
        var lawyerId = Guid.NewGuid();
        var subscription = new Subscription
        {
            Id = 1,
            Name = "تجريبية",
            AiRequestsLimit = 111,
            DurationDays = 30
        };
        var lawyerSubscription = new LawyerSubscription
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            SubscriptionId = 1,
            Subscription = subscription,
            UsedAiRequests = 10, // 101 left
            StartDate = DateTime.UtcNow.AddDays(-5),
            EndDate = DateTime.UtcNow.AddDays(25),
            IsActive = true
        };

        var runId = "test-run-456";

        // Add a previous charge transaction for this RunId
        var chargeTx = new AiPointTransaction
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            LawyerSubscriptionId = lawyerSubscription.Id,
            WorkflowRunId = runId,
            TransactionType = AiPointTransactionType.Charge,
            Points = 1,
            ReasonCode = AiPointReasonCode.Success,
            MessageAr = "First step charge"
        };

        var job = new AiJob
        {
            Id = Guid.NewGuid(),
            CaseId = Guid.NewGuid(),
            RunId = runId,
            WorkflowType = "SmartAnalysis",
            StepType = AiStepType.ClarifyFacts,
            PointCost = 1,
            ChargeState = AiChargeState.Pending
        };

        _dbContext.Subscriptions.Add(subscription);
        _dbContext.LawyerSubscriptions.Add(lawyerSubscription);
        _dbContext.AiPointTransactions.Add(chargeTx);
        _dbContext.AiJobs.Add(job);
        await _dbContext.SaveChangesAsync();

        // Act - Charge
        var result = await _sut.ChargeSuccessfulJobAsync(job, lawyerId, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.ChargedPoints.Should().Be(0); // 0 points charged
        result.Data.ChargeState.Should().Be(AiChargeState.NoCharge);
        result.Data.Balance!.Used.Should().Be(10); // Remains 10

        // Verify a NoCharge transaction was added
        var hasNoChargeTx = await _dbContext.AiPointTransactions
            .AnyAsync(t => t.AiJobId == job.Id && t.TransactionType == AiPointTransactionType.NoCharge);
        hasNoChargeTx.Should().BeTrue();
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
