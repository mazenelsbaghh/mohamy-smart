using Lawyer.Application.Common.Interface;
using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Lawyer.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lawyer.Tests.Services;

public class AdminLawyerServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;

    public AdminLawyerServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"AdminLawyerServiceTests-{Guid.NewGuid()}")
            .Options;

        _dbContext = new AppDbContext(options);
    }

    [Fact]
    public async Task GetLawyerDetailAsync_ExistingLawyer_ReturnsCompleteAdminProfile()
    {
        var now = DateTime.UtcNow;
        var userId = Guid.NewGuid();
        var lawyerId = Guid.NewGuid();

        var user = new ApplicationUser
        {
            Id = userId,
            FullName = "المحامي كامل البيانات",
            Email = "lawyer@example.com",
            PhoneNumber = "01000000000",
            PhoneNumberConfirmed = true,
            EmailConfirmed = false,
            IsActive = true,
            UserType = UserType.Lawyer,
            CreatedAt = now.AddDays(-20),
            Governorate = "القاهرة",
            AgreedToTerms = true
        };

        var lawyer = new Core.Models.Lawyer
        {
            Id = lawyerId,
            ApplicationUserId = userId,
            ApplicationUser = user,
            BarNumber = "12345",
            Specialization = "القانون المدني",
            ExperienceNumber = "7",
            LawFirmName = "مكتب الاختبار",
            BirthDate = "1990-01-01",
            Created = now.AddDays(-19),
            CreatedBy = userId,
            UpdatedBy = userId,
            IsActive = true
        };
        user.Lawyer = lawyer;

        var subscription = new Subscription
        {
            Id = 1,
            Name = "Pro",
            Price = 500,
            YearlyPrice = 5000,
            DurationDays = 30,
            AiRequestsLimit = 100,
            Created = now.AddDays(-30),
            CreatedBy = userId,
            UpdatedBy = userId,
            IsActive = true
        };

        _dbContext.Users.Add(user);
        _dbContext.Set<Core.Models.Lawyer>().Add(lawyer);
        _dbContext.Subscriptions.Add(subscription);
        _dbContext.Set<LawyerSubscription>().Add(new LawyerSubscription
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            SubscriptionId = subscription.Id,
            Subscription = subscription,
            StartDate = now.AddDays(-10),
            EndDate = now.AddDays(20),
            UsedAiRequests = 12,
            Created = now.AddDays(-10),
            CreatedBy = userId,
            UpdatedBy = userId,
            IsActive = true
        });
        _dbContext.Cases.AddRange(
            new Case
            {
                Id = Guid.NewGuid(),
                LawyerId = lawyerId,
                Title = "دعوى تعويض",
                Number = "2026/45",
                Court = "محكمة جنوب القاهرة",
                ClientName = "عميل نشط",
                Status = CaseStatus.Open,
                CaseTypeId = 1,
                Facts = "وقائع",
                LegalClaims = "طلبات",
                Created = now.AddDays(-1),
                CreatedBy = userId,
                UpdatedBy = userId,
                IsActive = true
            },
            new Case
            {
                Id = Guid.NewGuid(),
                LawyerId = lawyerId,
                Title = "ملف مؤرشف",
                Number = "2026/46",
                Court = "محكمة القاهرة",
                ClientName = "عميل سابق",
                Status = CaseStatus.Closed,
                CaseTypeId = 1,
                Facts = "وقائع",
                LegalClaims = "طلبات",
                Created = now.AddDays(-5),
                CreatedBy = userId,
                UpdatedBy = userId,
                IsActive = false
            });
        _dbContext.Clients.Add(new Client
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            ClientName = "عميل",
            Created = now.AddDays(-4),
            CreatedBy = userId,
            UpdatedBy = userId,
            IsActive = true
        });
        _dbContext.PowerOfAttorneys.Add(new PowerOfAttorney
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            Number = "POA-1",
            Title = "توكيل عام",
            IssueDate = now.AddDays(-3),
            Created = now.AddDays(-3),
            CreatedBy = userId,
            UpdatedBy = userId,
            IsActive = true,
            IsCanceled = false
        });
        _dbContext.Reviews.Add(new Review
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId.ToString(),
            ReviewerName = "عميل راض",
            Rating = 5,
            Comment = "خدمة ممتازة",
            Status = "Approved",
            Created = now.AddDays(-2),
            CreatedBy = userId,
            UpdatedBy = userId,
            IsActive = true
        });
        _dbContext.AiUsageRecords.Add(new AiUsageRecord
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            AiStepType = AiStepType.FactAnalysis,
            Provider = "google",
            ModelIdentifier = "gemini",
            InputTokens = 100,
            OutputTokens = 50,
            TotalTokens = 150,
            EstimatedCostUsd = 1.25m,
            CreatedAt = now
        });
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();

        var result = await sut.GetLawyerDetailAsync(userId, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(userId);
        result.Data.LawyerId.Should().Be(lawyerId);
        result.Data.Subscription!.PlanName.Should().Be("Pro");
        result.Data.Activity.CasesCount.Should().Be(2);
        result.Data.Activity.ActiveCasesCount.Should().Be(1);
        result.Data.Activity.ClientsCount.Should().Be(1);
        result.Data.Activity.PowersOfAttorneyCount.Should().Be(1);
        result.Data.Activity.ReviewsCount.Should().Be(1);
        result.Data.Activity.AiUsageCount.Should().Be(1);
        result.Data.Activity.AiTotalTokens.Should().Be(150);
        result.Data.RecentCases.Should().HaveCount(2);
        result.Data.RecentAiUsage.Single().Provider.Should().Be("google");
    }

    [Fact]
    public async Task GetLawyerDetailAsync_UserWithoutLawyerProfile_ReturnsNotFound()
    {
        var userId = Guid.NewGuid();
        _dbContext.Users.Add(new ApplicationUser
        {
            Id = userId,
            FullName = "مستخدم بلا ملف مهني",
            UserType = UserType.Lawyer,
            IsActive = true
        });
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();

        var result = await sut.GetLawyerDetailAsync(userId, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    private AdminLawyerService CreateSut()
    {
        return new AdminLawyerService(
            new UnitOfWork(_dbContext, CreateUserManager()),
            new Mock<ILogger<AdminLawyerService>>().Object,
            new Mock<IAuditService>().Object);
    }

    private static UserManager<ApplicationUser> CreateUserManager()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        return new Mock<UserManager<ApplicationUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!).Object;
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
