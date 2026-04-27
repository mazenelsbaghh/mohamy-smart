using System.Reflection;
using FluentAssertions;
using Hangfire;
using Lawyer.Application.Dtos.AiJobs;
using Lawyer.Application.IServices;
using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Lawyer.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Lawyer.Tests.Services;

public class AiJobServiceTests
{
    private readonly DbContextOptions<AppDbContext> _dbOptions;

    public AiJobServiceTests()
    {
        _dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public void IsDuplicateActiveJobViolation_ShouldReturnTrue_ForSqlError2601()
    {
        // Arrange
        var sqlExceptionStub = new SqlExceptionStub(2601);
        var dbUpdateException = new DbUpdateException("Error", sqlExceptionStub);

        var method = typeof(AiJobService).GetMethod("IsDuplicateActiveJobViolation", BindingFlags.Static | BindingFlags.NonPublic);
        method.Should().NotBeNull();

        // Act
        var result = (bool)method!.Invoke(null, [dbUpdateException])!;

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsDuplicateActiveJobViolation_ShouldReturnTrue_ForSqlError2627()
    {
        // Arrange
        var sqlExceptionStub = new SqlExceptionStub(2627);
        var dbUpdateException = new DbUpdateException("Error", sqlExceptionStub);

        var method = typeof(AiJobService).GetMethod("IsDuplicateActiveJobViolation", BindingFlags.Static | BindingFlags.NonPublic);
        method.Should().NotBeNull();

        // Act
        var result = (bool)method!.Invoke(null, [dbUpdateException])!;

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task GetActiveJobAsync_ShouldReturnLatestJob_WhenMultipleActiveJobsExist()
    {
        // Arrange
        await using var db = new AppDbContext(_dbOptions);
        var caseId = Guid.NewGuid();
        var stepType = AiStepType.FactAnalysis;

        var olderJob = new AiJob 
        { 
            Id = Guid.NewGuid(), 
            CaseId = caseId, 
            StepType = stepType, 
            Status = AiJobStatus.Processing, 
            CreatedAt = DateTime.UtcNow.AddMinutes(-10) 
        };
        var newerJob = new AiJob 
        { 
            Id = Guid.NewGuid(), 
            CaseId = caseId, 
            StepType = stepType, 
            Status = AiJobStatus.Processing, 
            CreatedAt = DateTime.UtcNow 
        };

        db.AiJobs.Add(olderJob);
        db.AiJobs.Add(newerJob);
        await db.SaveChangesAsync();

        var hangfireMock = new Mock<IBackgroundJobClient>();
        var notificationsMock = new Mock<IAiJobNotificationService>();
        var accessMock = new Mock<ICaseAccessValidator>();
        accessMock.Setup(x => x.ValidateAsync(caseId, "user123", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Succeeded = true, Data = true, StatusCode = System.Net.HttpStatusCode.OK });

        var sut = new AiJobService(db, hangfireMock.Object, notificationsMock.Object, accessMock.Object);

        var dto = new SubmitAiJobDto(stepType, "{}");

        // Act
        // SubmitAsync calls GetActiveJobAsync and returns it if found.
        var result = await sut.SubmitAsync(caseId, dto, "user123", CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(newerJob.Id); // Ensures the newer job was fetched
    }

    // A stub to mimic SqlException which has a "Number" property
    private class SqlExceptionStub : Exception
    {
        public int Number { get; }
        public SqlExceptionStub(int number) : base("Simulated SQL Exception")
        {
            Number = number;
        }
    }
}
