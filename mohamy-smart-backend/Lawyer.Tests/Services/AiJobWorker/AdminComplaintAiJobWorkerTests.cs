using FluentAssertions;
using Lawyer.Application.Dtos.AdminComplaint;
using Lawyer.Core.Enum;
using Moq;

namespace Lawyer.Tests.Services.AiJobWorker;

public class AdminComplaintAiJobWorkerTests
{
    [Theory]
    [InlineData(AiStepType.AdminComplaintClassification, 1)]
    [InlineData(AiStepType.AdminComplaintFacts, 2)]
    [InlineData(AiStepType.AdminComplaintViolation, 3)]
    [InlineData(AiStepType.AdminComplaintRequests, 4)]
    [InlineData(AiStepType.AdminComplaintAssembly, 5)]
    public async Task ProcessAsync_ShouldRouteAdminComplaintSteps_ToLatestWorkflow(AiStepType stepType, int stepNumber)
    {
        using var fixture = new AiJobWorkerTestFixture();
        var caseId = Guid.NewGuid();
        var inputJson = $"{{\"step\":\"{stepType}\"}}";

        var job = await fixture.SeedJobAsync(stepType, caseId);
        await fixture.SeedAdminComplaintWorkflowAsync(caseId, "lawyer-old", DateTime.UtcNow.AddMinutes(-5));
        var latestWorkflow = await fixture.SeedAdminComplaintWorkflowAsync(caseId, "lawyer-new", DateTime.UtcNow);

        fixture.AdminComplaintService
            .Setup(x => x.RunStepAsync(
                latestWorkflow.Id,
                stepNumber,
                It.Is<RunComplaintStepRequest>(request => request.Input == inputJson),
                latestWorkflow.LawyerId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(AiJobWorkerTestFixture.Success(new { domain = "admin-complaint", stepNumber }));

        var sut = fixture.CreateSut();

        await sut.ProcessAsync(job.Id, inputJson, CancellationToken.None);

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Completed);
        persisted.ResultJson.Should().Contain("admin-complaint").And.Contain(stepNumber.ToString());

        fixture.AdminComplaintService.VerifyAll();
    }

    [Fact]
    public async Task ProcessAsync_ShouldFailAdminComplaintJob_WhenWorkflowIsMissing()
    {
        using var fixture = new AiJobWorkerTestFixture();
        var job = await fixture.SeedJobAsync(AiStepType.AdminComplaintClassification);
        var sut = fixture.CreateSut();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            sut.ProcessAsync(job.Id, "{\"classification\":true}", CancellationToken.None));

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Failed);
        persisted.ErrorMessage.Should().Be("حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }

    [Fact]
    public async Task ProcessAsync_ShouldPersistFailure_WhenAdminComplaintServiceReturnsError()
    {
        using var fixture = new AiJobWorkerTestFixture();
        var caseId = Guid.NewGuid();
        var job = await fixture.SeedJobAsync(AiStepType.AdminComplaintAssembly, caseId);
        var workflow = await fixture.SeedAdminComplaintWorkflowAsync(caseId, "lawyer-1");

        fixture.AdminComplaintService
            .Setup(x => x.RunStepAsync(
                workflow.Id,
                5,
                It.IsAny<RunComplaintStepRequest>(),
                workflow.LawyerId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(AiJobWorkerTestFixture.Failure("admin complaint failed"));

        var sut = fixture.CreateSut();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            sut.ProcessAsync(job.Id, "{\"assembly\":true}", CancellationToken.None));

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Failed);
        persisted.ErrorMessage.Should().Be("حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }
}
