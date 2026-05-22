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

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
