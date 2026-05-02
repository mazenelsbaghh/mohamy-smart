using Lawyer.Application.Dtos.InternalRegulations;
using Lawyer.Application.Services;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Lawyer.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lawyer.Tests.Services;

public class InternalRegulationServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;

    public InternalRegulationServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"InternalRegulationServiceTests-{Guid.NewGuid()}")
            .Options;

        _dbContext = new AppDbContext(options);
    }

    [Fact]
    public async Task GetByIdAsync_RegulationOwnedByDifferentLawyer_ReturnsNotFound()
    {
        var ownerLawyerId = Guid.NewGuid();
        var otherLawyerId = Guid.NewGuid();
        var regulationId = Guid.NewGuid();

        _dbContext.InternalRegulations.Add(new InternalRegulation
        {
            Id = regulationId,
            LawyerId = ownerLawyerId,
            Title = "لائحة داخلية",
            Content = "نص اللائحة",
            IsActive = true
        });
        await _dbContext.SaveChangesAsync();

        var sut = CreateInternalRegulationService();

        var result = await sut.GetByIdAsync(regulationId, otherLawyerId, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateCaseInternalRegulationsAsync_DuplicateIds_CreatesSingleCaseLink()
    {
        var lawyerId = Guid.NewGuid();
        var caseId = Guid.NewGuid();
        var regulationId = Guid.NewGuid();

        _dbContext.Cases.Add(new Case
        {
            Id = caseId,
            LawyerId = lawyerId,
            Title = "قضية مدنية",
            Number = "1",
            CaseTypeId = 1,
            ClientName = "موكل",
            Facts = "وقائع",
            LegalClaims = "طلبات"
        });
        _dbContext.InternalRegulations.Add(new InternalRegulation
        {
            Id = regulationId,
            LawyerId = lawyerId,
            Title = "اللائحة الداخلية",
            Content = "نص اللائحة الداخلية",
            IsActive = true
        });
        await _dbContext.SaveChangesAsync();

        var sut = CreateCaseService();

        var result = await sut.UpdateCaseInternalRegulationsAsync(
            caseId,
            new UpdateCaseInternalRegulationsDto
            {
                InternalRegulationIds = new List<Guid> { regulationId, regulationId }
            },
            lawyerId,
            true,
            CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        _dbContext.CaseInternalRegulations.Count(x => x.CaseId == caseId && x.InternalRegulationId == regulationId)
            .Should().Be(1);
        _dbContext.Cases.Single(x => x.Id == caseId).InternalRegulationsContext
            .Should().Contain("اللائحة الداخلية");
    }

    private InternalRegulationService CreateInternalRegulationService()
    {
        return new InternalRegulationService(
            CreateUnitOfWork(),
            new Mock<ILogger<InternalRegulationService>>().Object);
    }

    private CaseService CreateCaseService()
    {
        return new CaseService(
            CreateUnitOfWork(),
            new Mock<ILogger<CaseService>>().Object);
    }

    private UnitOfWork CreateUnitOfWork()
    {
        return new UnitOfWork(_dbContext, CreateUserManager());
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
