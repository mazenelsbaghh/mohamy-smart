using FluentAssertions;
using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Lawyer.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace Lawyer.Tests.Services;

public class WorkflowSnapshotServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;

    public WorkflowSnapshotServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"WorkflowSnapshotServiceTests-{Guid.NewGuid()}")
            .Options;
        _dbContext = new AppDbContext(options);
    }

    [Fact]
    public async Task GetSnapshotsByCaseAsync_ShouldReturnSnapshotsStoredWithUserIdAndLawyerProfileId()
    {
        var caseId = Guid.NewGuid();
        var applicationUserId = Guid.NewGuid();
        var lawyerProfileId = Guid.NewGuid();
        await SeedLawyerCaseAsync(caseId, applicationUserId, lawyerProfileId);

        _dbContext.WorkflowSnapshots.AddRange(
            new WorkflowSnapshot
            {
                CaseId = caseId,
                LawyerId = applicationUserId.ToString(),
                WorkflowType = "exec-request",
                OutputsJson = """{"1":{"requestType":"old-user-id"}}""",
                CurrentStep = 1,
                CreatedAt = DateTime.UtcNow.AddMinutes(-2),
            },
            new WorkflowSnapshot
            {
                CaseId = caseId,
                LawyerId = lawyerProfileId.ToString(),
                WorkflowType = "exec-request",
                OutputsJson = """{"1":{"requestType":"profile-id"}}""",
                CurrentStep = 1,
                CreatedAt = DateTime.UtcNow.AddMinutes(-1),
            });
        await _dbContext.SaveChangesAsync();

        var service = CreateSut();

        var result = await service.GetSnapshotsByCaseAsync(caseId, lawyerProfileId.ToString(), CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().HaveCount(2);
        result.Data!.Select(x => x.OutputsJson).Should().Contain(x => x.Contains("old-user-id"));
        result.Data!.Select(x => x.OutputsJson).Should().Contain(x => x.Contains("profile-id"));
    }

    [Fact]
    public async Task CreateSnapshotAsync_ShouldStoreSnapshotWithCanonicalLawyerProfileId()
    {
        var caseId = Guid.NewGuid();
        var applicationUserId = Guid.NewGuid();
        var lawyerProfileId = Guid.NewGuid();
        await SeedLawyerCaseAsync(caseId, applicationUserId, lawyerProfileId);

        var service = CreateSut();

        var result = await service.CreateSnapshotAsync(
            caseId,
            applicationUserId.ToString(),
            "exec-request",
            """{"1":{"requestType":"classification"}}""",
            1,
            null,
            CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        var snapshot = await _dbContext.WorkflowSnapshots.SingleAsync();
        snapshot.LawyerId.Should().Be(lawyerProfileId.ToString());
    }

    private async Task SeedLawyerCaseAsync(Guid caseId, Guid applicationUserId, Guid lawyerProfileId)
    {
        if (!await _dbContext.CaseTypes.AnyAsync(x => x.Id == 1))
        {
            _dbContext.CaseTypes.Add(new CaseType { Id = 1, Title = "Workflow" });
            await _dbContext.SaveChangesAsync();
        }

        _dbContext.Users.Add(new ApplicationUser
        {
            Id = applicationUserId,
            UserName = "snapshot@test.local",
            FullName = "Snapshot Lawyer"
        });
        _dbContext.Set<Lawyer.Core.Models.Lawyer>().Add(new Lawyer.Core.Models.Lawyer
        {
            Id = lawyerProfileId,
            ApplicationUserId = applicationUserId
        });
        _dbContext.Cases.Add(new Case
        {
            Id = caseId,
            CaseTypeId = 1,
            LawyerId = lawyerProfileId,
            Title = "قضية اختبار",
            Number = "1",
            Court = "محكمة",
            ClientName = "عميل",
            ApponentName = "خصم",
            Status = CaseStatus.Open
        });
        await _dbContext.SaveChangesAsync();
    }

    private WorkflowSnapshotService CreateSut()
    {
        var userManager = new Mock<UserManager<ApplicationUser>>(
            Mock.Of<IUserStore<ApplicationUser>>(),
            null!, null!, null!, null!, null!, null!, null!, null!).Object;
        return new WorkflowSnapshotService(
            new UnitOfWork(_dbContext, userManager),
            Mock.Of<ILogger<WorkflowSnapshotService>>());
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
