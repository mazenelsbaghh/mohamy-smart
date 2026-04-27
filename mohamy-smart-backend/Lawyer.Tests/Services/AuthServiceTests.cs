using Lawyer.Application.Common;
using Lawyer.Application.Common.Interface;
using Lawyer.Application.Dto.Auth;
using Lawyer.Application.IServices;
using Lawyer.Application.Services;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Lawyer.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lawyer.Tests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<ILogger<AuthService>> _loggerMock;
    private readonly Mock<IAuditService> _auditMock;
    private readonly Mock<IDateTimeProvider> _dateTimeProviderMock;
    private readonly Mock<IUserContextProvider> _userContextProviderMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly Mock<ISmsSender> _smsSenderMock;

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"AuthServiceTests-{Guid.NewGuid()}")
            .Options;

        _dbContext = new AppDbContext(options);

        var store = new Mock<IUserStore<ApplicationUser>>();
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        _tokenServiceMock = new Mock<ITokenService>();
        _loggerMock = new Mock<ILogger<AuthService>>();
        _auditMock = new Mock<IAuditService>();
        _dateTimeProviderMock = new Mock<IDateTimeProvider>();
        _userContextProviderMock = new Mock<IUserContextProvider>();
        _emailServiceMock = new Mock<IEmailService>();
        _smsSenderMock = new Mock<ISmsSender>();

        _userContextProviderMock.Setup(x => x.GetCurrentContext()).Returns(new UserContext
        {
            ClientIp = "127.0.0.1"
        });

        _dateTimeProviderMock.Setup(x => x.UtcNow).Returns(DateTime.UtcNow);
    }

    private AuthService CreateSut()
    {
        var userManager = CreateUserManager();
        var unitOfWork = new UnitOfWork(_dbContext, userManager);
        return new AuthService(
            _userManagerMock.Object,
            _tokenServiceMock.Object,
            unitOfWork,
            _loggerMock.Object,
            _auditMock.Object,
            _dateTimeProviderMock.Object,
            _userContextProviderMock.Object,
            _emailServiceMock.Object,
            _smsSenderMock.Object);
    }

    private static UserManager<ApplicationUser> CreateUserManager()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        return new Mock<UserManager<ApplicationUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!).Object;
    }

    [Fact]
    public async Task Login_WithNonExistentPhone_ReturnsBadRequest()
    {
        var sut = CreateSut();
        var loginDto = new LoginDto { PhoneNumber = "01000000000", Password = "Password123!" };

        var result = await sut.Login(loginDto, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithInactiveUser_ReturnsBadRequest()
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            PhoneNumber = "01000000000",
            UserName = "01000000000",
            PhoneNumberConfirmed = true,
            IsActive = false
        };

        _dbContext.Users.Add(user);

        var lawyer = new Core.Models.Lawyer
        {
            ApplicationUserId = user.Id,
            IsActive = false
        };
        _dbContext.Set<Core.Models.Lawyer>().Add(lawyer);
        await _dbContext.SaveChangesAsync();

        var sut = CreateSut();
        var loginDto = new LoginDto { PhoneNumber = "01000000000", Password = "Password123!" };

        var result = await sut.Login(loginDto, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
