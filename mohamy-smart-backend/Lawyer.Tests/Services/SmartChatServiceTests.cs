using FluentAssertions;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Application.Services;
using Lawyer.Application.Services.SmartAnalysis;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System.Net;

namespace Lawyer.Tests.Services;

public class SmartChatServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly Mock<IAIProvider> _provider = new();
    private readonly Mock<IAIProviderFactory> _providerFactory = new();
    private readonly Mock<IAiUsageTrackingService> _usageTracking = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly AiPointAccountingService _pointAccounting;

    public SmartChatServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"SmartChatServiceTests-{Guid.NewGuid()}")
            .Options;

        _dbContext = new AppDbContext(options);
        _pointAccounting = new AiPointAccountingService(_dbContext);

        var usageRepo = new Mock<IGenericRepository<AiUsageRecord>>();
        usageRepo.Setup(r => r.AsQueryable()).Returns(_dbContext.AiUsageRecords);
        usageRepo.Setup(r => r.AddAsync(It.IsAny<AiUsageRecord>()))
            .Callback<AiUsageRecord>(record => _dbContext.AiUsageRecords.Add(record))
            .Returns(Task.CompletedTask);
        _unitOfWork.Setup(u => u.Repository<AiUsageRecord>()).Returns(usageRepo.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns<CancellationToken>(ct => _dbContext.SaveChangesAsync(ct));

        _providerFactory.Setup(f => f.GetProvider()).Returns(_provider.Object);
        _providerFactory.Setup(f => f.GetModelForStepAsync(AiStepType.Chat)).ReturnsAsync("gemini-chat");
        _provider
            .Setup(p => p.SendChatCompletionAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<AIRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result<AIResponse>.Success(new AIResponse("رد قانوني عربي", new AIUsageMetadata(5, 7, 12))));
    }

    [Fact]
    public async Task ChatAsync_FifthSuccessfulReply_ShouldRemainFree()
    {
        var lawyerId = Guid.NewGuid();
        SeedActiveSubscription(lawyerId, usedPoints: 3, limit: 10);
        SeedSuccessfulChatUsage(lawyerId, 4);
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();
        var result = await sut.ChatAsync(lawyerId, new ChatRequestDto { Message = "رسالة" }, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        var subscription = await _dbContext.LawyerSubscriptions.SingleAsync(s => s.LawyerId == lawyerId);
        subscription.UsedAiRequests.Should().Be(3);
        _dbContext.AiPointTransactions.Count(t => t.LawyerId == lawyerId && t.TransactionType == AiPointTransactionType.Charge).Should().Be(0);
        _dbContext.AiPointTransactions.Count(t => t.LawyerId == lawyerId && t.TransactionType == AiPointTransactionType.NoCharge).Should().Be(1);
        _provider.Verify(p => p.SendChatCompletionAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<AIRequestOptions>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ChatAsync_SixthSuccessfulReply_ShouldChargeOnePoint()
    {
        var lawyerId = Guid.NewGuid();
        SeedActiveSubscription(lawyerId, usedPoints: 3, limit: 10);
        SeedSuccessfulChatUsage(lawyerId, 5);
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();
        var result = await sut.ChatAsync(lawyerId, new ChatRequestDto { Message = "رسالة" }, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        var subscription = await _dbContext.LawyerSubscriptions.SingleAsync(s => s.LawyerId == lawyerId);
        subscription.UsedAiRequests.Should().Be(4);
        var charge = await _dbContext.AiPointTransactions.SingleAsync(t => t.LawyerId == lawyerId && t.TransactionType == AiPointTransactionType.Charge);
        charge.StepType.Should().Be(AiStepType.Chat);
        charge.Points.Should().Be(1);
    }

    [Fact]
    public async Task ChatAsync_ExhaustedFreeQuotaWithoutPoints_ShouldReturnPaymentRequiredBeforeProviderCall()
    {
        var lawyerId = Guid.NewGuid();
        SeedActiveSubscription(lawyerId, usedPoints: 10, limit: 10);
        SeedSuccessfulChatUsage(lawyerId, 5);
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();
        var result = await sut.ChatAsync(lawyerId, new ChatRequestDto { Message = "رسالة" }, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.PaymentRequired);
        _provider.Verify(p => p.SendChatCompletionAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<AIRequestOptions>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    private SmartChatService CreateSut()
    {
        return new SmartChatService(
            Mock.Of<ILogger<SmartChatService>>(),
            _providerFactory.Object,
            _usageTracking.Object,
            _pointAccounting,
            _unitOfWork.Object);
    }

    private void SeedSuccessfulChatUsage(Guid lawyerId, int count)
    {
        for (var i = 0; i < count; i++)
        {
            _dbContext.AiUsageRecords.Add(new AiUsageRecord
            {
                LawyerId = lawyerId,
                AiStepType = AiStepType.Chat,
                ModelIdentifier = "gemini-chat",
                Provider = "Gemini",
                CreatedAt = DateTime.UtcNow.AddMinutes(-count + i)
            });
        }
    }

    private void SeedActiveSubscription(Guid lawyerId, int usedPoints, int limit)
    {
        var subscription = new Subscription
        {
            Id = Math.Abs(lawyerId.GetHashCode()),
            Name = "باقة اختبار",
            AiRequestsLimit = limit,
            DurationDays = 30
        };
        var lawyerSubscription = new LawyerSubscription
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            SubscriptionId = subscription.Id,
            Subscription = subscription,
            UsedAiRequests = usedPoints,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(29),
            IsActive = true
        };

        _dbContext.Subscriptions.Add(subscription);
        _dbContext.LawyerSubscriptions.Add(lawyerSubscription);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }
}
