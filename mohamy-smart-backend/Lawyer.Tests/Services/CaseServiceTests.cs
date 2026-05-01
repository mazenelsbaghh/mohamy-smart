using Lawyer.Application.Dtos.Case;
using Lawyer.Application.Services;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;

namespace Lawyer.Tests.Services;

public class CaseServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ILogger<CaseService>> _loggerMock;
    private readonly CaseService _service;

    public CaseServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _loggerMock = new Mock<ILogger<CaseService>>();
        _service = new CaseService(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    private void SetupRepository<T>(Mock<IGenericRepository<T>> repoMock) where T : class
    {
        _unitOfWorkMock.Setup(u => u.Repository<T>()).Returns(repoMock.Object);
    }

    [Fact]
    public async Task CreateCaseAsync_WithValidNewClient_ReturnsSuccess()
    {
        var lawyerId = Guid.NewGuid();
        var caseTypeRepoMock = new Mock<IGenericRepository<Core.Models.CaseType>>();
        var caseRepoMock = new Mock<IGenericRepository<Case>>();
        var clientRepoMock = new Mock<IGenericRepository<Client>>();

        SetupRepository(caseRepoMock);
        SetupRepository(clientRepoMock);
        SetupRepository(caseTypeRepoMock);

        var transactionMock = new Mock<IDbContextTransaction>();
        _unitOfWorkMock.Setup(u => u.BeginTransactionAsync())
            .ReturnsAsync(transactionMock.Object);

        caseTypeRepoMock.Setup(r => r.FirstOrDefaultAsync(
            It.IsAny<System.Linq.Expressions.Expression<Func<Core.Models.CaseType, bool>>>(),
            It.IsAny<CancellationToken>(),
            It.IsAny<System.Linq.Expressions.Expression<Func<Core.Models.CaseType, object>>[]>()))
            .ReturnsAsync((Core.Models.CaseType?)null);

        var dto = new CreateCaseDto
        {
            Title = "Test Case",
            Number = "C-001",
            CaseTypeIds = new List<int> { 1 },
            Court = "Cairo",
            ClientName = "Ahmed",
            Description = "desc",
            Facts = "facts",
            LegalClaims = "claims",
            IsExistedClient = false
        };

        var result = await _service.CreateCaseAsync(dto, lawyerId, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Title.Should().Be("Test Case");
        caseRepoMock.Verify(r => r.AddAsync(It.IsAny<Case>()), Times.Once);
        clientRepoMock.Verify(r => r.AddAsync(It.IsAny<Client>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_WithOwnershipMismatch_ThrowsForbiddenException()
    {
        var caseId = Guid.NewGuid();
        var ownerLawyerId = Guid.NewGuid();
        var otherLawyerId = Guid.NewGuid();

        var caseEntity = new Case
        {
            Id = caseId,
            LawyerId = ownerLawyerId,
            Title = "Test",
            Number = "C-001",
            CaseTypeId = 1
        };

        var caseRepoMock = new Mock<IGenericRepository<Case>>();
        caseRepoMock.Setup(r => r.FirstOrDefaultAsync(
            It.IsAny<System.Linq.Expressions.Expression<Func<Case, bool>>>(),
            It.IsAny<CancellationToken>(),
            It.IsAny<System.Linq.Expressions.Expression<Func<Case, object>>[]>()))
            .ReturnsAsync(caseEntity);

        SetupRepository(caseRepoMock);

        var act = () => _service.GetByIdAsync(caseId, otherLawyerId, true, CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenException>();
    }

    [Fact]
    public async Task DeleteCaseAsync_NonExistentCase_ReturnsNotFound()
    {
        var caseRepoMock = new Mock<IGenericRepository<Case>>();
        caseRepoMock.Setup(r => r.FirstOrDefaultAsync(
            It.IsAny<System.Linq.Expressions.Expression<Func<Case, bool>>>(),
            It.IsAny<CancellationToken>(),
            It.IsAny<System.Linq.Expressions.Expression<Func<Case, object>>[]>()))
            .ReturnsAsync((Case?)null);

        SetupRepository(caseRepoMock);

        var result = await _service.DeleteCaseAsync(Guid.NewGuid(), Guid.NewGuid(), true, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task SetArchiveStatusAsync_WithOwnedCase_ArchivesCase()
    {
        var caseId = Guid.NewGuid();
        var lawyerId = Guid.NewGuid();
        var caseEntity = new Case
        {
            Id = caseId,
            LawyerId = lawyerId,
            IsActive = true,
            Title = "Test",
            Number = "C-001",
            CaseTypeId = 1
        };

        var caseRepoMock = new Mock<IGenericRepository<Case>>();
        caseRepoMock.Setup(r => r.FirstOrDefaultAsync(
            It.IsAny<System.Linq.Expressions.Expression<Func<Case, bool>>>(),
            It.IsAny<CancellationToken>(),
            It.IsAny<System.Linq.Expressions.Expression<Func<Case, object>>[]>()))
            .ReturnsAsync(caseEntity);
        caseRepoMock.Setup(r => r.Update(It.IsAny<Case>()))
            .Returns(Task.CompletedTask);

        var caseTypeRepoMock = new Mock<IGenericRepository<Core.Models.CaseType>>();
        caseTypeRepoMock.Setup(r => r.FirstOrDefaultAsync(
            It.IsAny<System.Linq.Expressions.Expression<Func<Core.Models.CaseType, bool>>>(),
            It.IsAny<CancellationToken>(),
            It.IsAny<System.Linq.Expressions.Expression<Func<Core.Models.CaseType, object>>[]>()))
            .ReturnsAsync(new Core.Models.CaseType { Id = 1, Title = "مدني" });

        SetupRepository(caseRepoMock);
        SetupRepository(caseTypeRepoMock);

        var result = await _service.SetArchiveStatusAsync(caseId, true, lawyerId, true, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.IsActive.Should().BeFalse();
        caseRepoMock.Verify(r => r.Update(It.Is<Case>(c => c.Id == caseId && !c.IsActive)), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SetArchiveStatusAsync_WithOwnershipMismatch_ThrowsForbiddenException()
    {
        var caseId = Guid.NewGuid();
        var ownerLawyerId = Guid.NewGuid();
        var otherLawyerId = Guid.NewGuid();

        var caseEntity = new Case
        {
            Id = caseId,
            LawyerId = ownerLawyerId,
            Title = "Test",
            Number = "C-001",
            CaseTypeId = 1
        };

        var caseRepoMock = new Mock<IGenericRepository<Case>>();
        caseRepoMock.Setup(r => r.FirstOrDefaultAsync(
            It.IsAny<System.Linq.Expressions.Expression<Func<Case, bool>>>(),
            It.IsAny<CancellationToken>(),
            It.IsAny<System.Linq.Expressions.Expression<Func<Case, object>>[]>()))
            .ReturnsAsync(caseEntity);

        SetupRepository(caseRepoMock);

        var act = () => _service.SetArchiveStatusAsync(caseId, true, otherLawyerId, true, CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenException>();
    }
}
