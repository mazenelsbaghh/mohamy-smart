using Lawyer.Application.IServices;
using Lawyer.Application.Services;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Lawyer.Core.Setting;
using Lawyer.Infrastructure.Persistence;
using Lawyer.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lawyer.Tests.Services;

public class PaymentServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly Mock<ISubscriptionService> _subscriptionServiceMock;
    private readonly Mock<IHttpClientFactory> _httpClientFactoryMock;
    private readonly Mock<ILogger<PaymobService>> _loggerMock;
    private readonly IOptions<PaymobSettings> _settings;

    public PaymentServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"PaymentServiceTests-{Guid.NewGuid()}")
            .Options;

        _dbContext = new AppDbContext(options);
        _subscriptionServiceMock = new Mock<ISubscriptionService>();
        _httpClientFactoryMock = new Mock<IHttpClientFactory>();
        _loggerMock = new Mock<ILogger<PaymobService>>();

        _settings = Options.Create(new PaymobSettings
        {
            SecretKey = "test-key",
            PublicKey = "test-public",
            HMAC = "test-hmac",
            CardIntegrationId = "1",
            MobileIntegrationId = "2",
            CallbackBaseUrl = "https://localhost"
        });
    }

    private PaymobService CreateSut()
    {
        var userManager = CreateUserManager();
        var unitOfWork = new UnitOfWork(_dbContext, userManager);
        return new PaymobService(
            unitOfWork,
            _subscriptionServiceMock.Object,
            _httpClientFactoryMock.Object,
            _settings,
            _loggerMock.Object);
    }

    private static UserManager<ApplicationUser> CreateUserManager()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        return new Mock<UserManager<ApplicationUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!).Object;
    }

    [Fact]
    public async Task GetPaymentHistoryAsync_PageSizeExceeds100_IsCappedTo100()
    {
        var lawyerId = Guid.NewGuid();

        var sub = new Subscription
        {
            Name = "Basic",
            Price = 100,
            DurationDays = 30,
            IsActive = true
        };
        _dbContext.Subscriptions.Add(sub);
        await _dbContext.SaveChangesAsync();

        for (int i = 0; i < 5; i++)
        {
            _dbContext.Payments.Add(new Payment
            {
                LawyerId = lawyerId,
                SubscriptionId = sub.Id,
                Amount = 100,
                Currency = "EGP",
                PaymentMethod = "card",
                TransactionId = $"txn-{i}",
                Status = Lawyer.Core.Enum.PaymentStatus.Success
            });
        }
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();
        var result = await sut.GetPaymentHistoryAsync(lawyerId, CancellationToken.None, pageNumber: 1, pageSize: 500);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.PageSize.Should().Be(100);
        result.Data.Data.Should().HaveCount(5);
    }

    [Fact]
    public async Task GetPaymentHistoryAsync_PageNumberBeyondData_ReturnsEmptyList()
    {
        var lawyerId = Guid.NewGuid();

        var sub = new Subscription
        {
            Name = "Basic",
            Price = 100,
            DurationDays = 30,
            IsActive = true
        };
        _dbContext.Subscriptions.Add(sub);
        await _dbContext.SaveChangesAsync();

        _dbContext.Payments.Add(new Payment
        {
            LawyerId = lawyerId,
            SubscriptionId = sub.Id,
            Amount = 100,
            Currency = "EGP",
            PaymentMethod = "card",
            TransactionId = "txn-1",
            Status = Lawyer.Core.Enum.PaymentStatus.Success
        });
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();
        var result = await sut.GetPaymentHistoryAsync(lawyerId, CancellationToken.None, pageNumber: 999, pageSize: 10);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Data.Should().BeEmpty();
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
