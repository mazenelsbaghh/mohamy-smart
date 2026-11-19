using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using Lawyer.Application.IServices;
using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Lawyer.Core.Setting;
using Lawyer.Infrastructure.Persistence;
using Lawyer.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

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
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
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

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task VerifiedPayment_ActivatesOnceDespiteDisconnectedCallerAndEmailFailure(bool useBrowserCallback)
    {
        const string orderId = "test-order";
        var lawyer = new Core.Models.Lawyer
        {
            ApplicationUser = new ApplicationUser { Email = "lawyer@example.test" }
        };
        var plan = new Subscription { Name = "Basic", Price = 500, DurationDays = 30 };
        var payment = new Payment
        {
            Lawyer = lawyer,
            Subscription = plan,
            TransactionId = orderId,
            Amount = 500,
            Status = PaymentStatus.Pending
        };
        _dbContext.Payments.Add(payment);
        await _dbContext.SaveChangesAsync();
        _dbContext.ChangeTracker.Clear();

        var unitOfWork = new UnitOfWork(_dbContext, CreateUserManager());
        var email = new Mock<IEmailService>(MockBehavior.Strict);
        var subscriptions = new SubscriptionService(unitOfWork, NullLogger<SubscriptionService>.Instance, email.Object);
        var backgroundJobs = new Mock<IBackgroundJobClient>();
        var queuedConfirmations = new List<Job>();
        backgroundJobs.Setup(client => client.Create(It.IsAny<Job>(), It.IsAny<EnqueuedState>()))
            .Callback((Job job, IState _) => queuedConfirmations.Add(job))
            .Returns("confirmation-job");
        var sut = new PaymobService(unitOfWork, subscriptions, _httpClientFactoryMock.Object,
            _settings, _loggerMock.Object, backgroundJobs.Object);

        var disconnected = new CancellationToken(canceled: true);
        using var payload = JsonDocument.Parse("""
            {"obj":{"amount_cents":50000,"currency":"EGP","id":42,"order":{"id":99,"merchant_order_id":"test-order"},"success":true}}
            """);
        var processing = useBrowserCallback
            ? await sut.HandleLocalGetCallbackAsync(orderId, true, "signed-fields", Sign("signed-fields"), disconnected)
            : await sut.HandleServerCallbackAsync(Sign("50000EGP4299true"), payload.RootElement, disconnected);
        var retry = await sut.HandleServerCallbackAsync(Sign("50000EGP4299true"), payload.RootElement, disconnected);

        processing.Succeeded.Should().BeTrue();
        retry.Succeeded.Should().BeTrue();
        var subscription = Assert.Single(await _dbContext.LawyerSubscriptions.AsNoTracking().ToListAsync());
        subscription.IsActive.Should().BeTrue();
        subscription.LawyerId.Should().Be(lawyer.Id);
        (await _dbContext.Payments.AsNoTracking().SingleAsync()).Status.Should().Be(PaymentStatus.Success);
        var confirmation = Assert.Single(queuedConfirmations);
        confirmation.Method.Name.Should().Be(nameof(ISubscriptionService.SendSubscriptionConfirmationAsync));
        confirmation.Args[0].Should().Be(subscription.Id);

        email.Setup(service => service.SendEmailAsync(
            "lawyer@example.test", It.IsAny<string>(), It.IsAny<string>(), "SubscriptionConfirmation",
            subscription.Id.ToString(), lawyer.ApplicationUser.Id, It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var delivery = confirmation.Method.CreateDelegate<Func<Guid, CancellationToken, Task>>(subscriptions);
        await delivery((Guid)confirmation.Args[0], CancellationToken.None);

        (await _dbContext.LawyerSubscriptions.AsNoTracking().SingleAsync()).IsActive.Should().BeTrue();
        (await _dbContext.Payments.AsNoTracking().SingleAsync()).Status.Should().Be(PaymentStatus.Success);
    }

    private string Sign(string signedFields) =>
        Convert.ToHexString(HMACSHA512.HashData(Encoding.UTF8.GetBytes(_settings.Value.HMAC),
            Encoding.UTF8.GetBytes(signedFields)));

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
