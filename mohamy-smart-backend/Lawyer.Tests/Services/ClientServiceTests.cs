using Lawyer.Application.Common.Interface;
using Lawyer.Application.Dtos.Client;
using Lawyer.Application.Services;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Lawyer.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lawyer.Tests.Services;

public class ClientServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly Mock<ILogger<ClientService>> _loggerMock;
    private readonly Mock<IFileUploadService> _fileUploadServiceMock;

    public ClientServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"ClientServiceTests-{Guid.NewGuid()}")
            .Options;

        _dbContext = new AppDbContext(options);
        _loggerMock = new Mock<ILogger<ClientService>>();
        _fileUploadServiceMock = new Mock<IFileUploadService>();
    }

    private ClientService CreateSut()
    {
        var userManager = CreateUserManager();
        var unitOfWork = new UnitOfWork(_dbContext, userManager);
        return new ClientService(unitOfWork, _loggerMock.Object, _fileUploadServiceMock.Object);
    }

    private static UserManager<ApplicationUser> CreateUserManager()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        return new Mock<UserManager<ApplicationUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!).Object;
    }

    [Fact]
    public async Task GetByIdAsync_ClientExists_ReturnsClient()
    {
        var clientId = Guid.NewGuid();
        var lawyerId = Guid.NewGuid();

        _dbContext.Clients.Add(new Client
        {
            Id = clientId,
            ClientName = "Ali",
            LawyerId = lawyerId,
            IsActive = true
        });
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();
        var result = await sut.GetByIdAsync(clientId, true, lawyerId, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.ClientName.Should().Be("Ali");
        result.Data.Id.Should().Be(clientId);
    }

    [Fact]
    public async Task GetByIdAsync_ClientNotFound_ReturnsNotFound()
    {
        var sut = CreateSut();
        var result = await sut.GetByIdAsync(Guid.NewGuid(), true, Guid.NewGuid(), CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetByIdAsync_OwnershipMismatch_ThrowsForbiddenException()
    {
        var clientId = Guid.NewGuid();
        var ownerLawyerId = Guid.NewGuid();
        var otherLawyerId = Guid.NewGuid();

        _dbContext.Clients.Add(new Client
        {
            Id = clientId,
            ClientName = "Ali",
            LawyerId = ownerLawyerId,
            IsActive = true
        });
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();
        var act = () => sut.GetByIdAsync(clientId, true, otherLawyerId, CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenException>();
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
