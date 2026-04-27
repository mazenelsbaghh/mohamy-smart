using FluentAssertions;
using Lawyer.Application.Dtos.ExecRequest;
using Lawyer.Core.Enum;
using Moq;

namespace Lawyer.Tests.Services.AiJobWorker;

public class ExecRequestAiJobWorkerTests
{
    [Theory]
    [InlineData(AiStepType.ExecRequestClassification, 1)]
    [InlineData(AiStepType.ExecRequestDrafting, 2)]
    [InlineData(AiStepType.ExecRequestAssembly, 3)]
    public async Task ProcessAsync_ShouldRouteExecRequestSteps_ToLatestWorkflow(AiStepType stepType, int stepNumber)
    {
        using var fixture = new AiJobWorkerTestFixture();
        var caseId = Guid.NewGuid();
        var inputJson = $"{{\"step\":\"{stepType}\"}}";

        var job = await fixture.SeedJobAsync(stepType, caseId);
        await fixture.SeedExecRequestWorkflowAsync(caseId, "lawyer-old", DateTime.UtcNow.AddMinutes(-5));
        var latestWorkflow = await fixture.SeedExecRequestWorkflowAsync(caseId, "lawyer-new", DateTime.UtcNow);

        fixture.ExecRequestService
            .Setup(x => x.RunStepAsync(
                latestWorkflow.Id,
                stepNumber,
                It.Is<RunExecStepRequest>(request => request.Input == inputJson),
                latestWorkflow.LawyerId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(AiJobWorkerTestFixture.Success(new { domain = "exec-request", stepNumber }));

        var sut = fixture.CreateSut();

        await sut.ProcessAsync(job.Id, inputJson, CancellationToken.None);

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Completed);
        persisted.ResultJson.Should().Contain("exec-request").And.Contain(stepNumber.ToString());

        fixture.ExecRequestService.VerifyAll();
    }

    [Fact]
    public async Task ProcessAsync_ShouldFailExecRequestJob_WhenWorkflowIsMissing()
    {
        using var fixture = new AiJobWorkerTestFixture();
        var job = await fixture.SeedJobAsync(AiStepType.ExecRequestClassification);
        var sut = fixture.CreateSut();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            sut.ProcessAsync(job.Id, "{\"classification\":true}", CancellationToken.None));

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Failed);
        persisted.ErrorMessage.Should().Be("حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }

    [Fact]
    public async Task ProcessAsync_ShouldPersistFailure_WhenExecRequestServiceReturnsError()
    {
        using var fixture = new AiJobWorkerTestFixture();
        var caseId = Guid.NewGuid();
        var job = await fixture.SeedJobAsync(AiStepType.ExecRequestAssembly, caseId);
        var workflow = await fixture.SeedExecRequestWorkflowAsync(caseId, "lawyer-1");

        fixture.ExecRequestService
            .Setup(x => x.RunStepAsync(
                workflow.Id,
                3,
                It.IsAny<RunExecStepRequest>(),
                workflow.LawyerId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(AiJobWorkerTestFixture.Failure("exec request failed"));

        var sut = fixture.CreateSut();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            sut.ProcessAsync(job.Id, "{\"assembly\":true}", CancellationToken.None));

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Failed);
        persisted.ErrorMessage.Should().Be("حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }

    [Fact]
    public async Task ProcessAsync_ShouldMarkJobFailedWithoutThrowing_WhenWorkflowConflictOccurs()
    {
        using var fixture = new AiJobWorkerTestFixture();
        var caseId = Guid.NewGuid();
        var job = await fixture.SeedJobAsync(AiStepType.ExecRequestDrafting, caseId);
        var workflow = await fixture.SeedExecRequestWorkflowAsync(caseId, "lawyer-1");

        fixture.ExecRequestService
            .Setup(x => x.RunStepAsync(
                workflow.Id,
                2,
                It.IsAny<RunExecStepRequest>(),
                workflow.LawyerId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(AiJobWorkerTestFixture.Conflict("تم تحديث سير العمل من قبل مستخدم آخر. يرجى إعادة تحميل الصفحة."));

        var sut = fixture.CreateSut();

        await sut.ProcessAsync(job.Id, "{\"drafting\":true}", CancellationToken.None);

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Failed);
        persisted.ErrorMessage.Should().Be("تم تحديث سير العمل أثناء تنفيذ التحليل. يرجى إعادة تحميل الصفحة ثم إعادة المحاولة.");

        fixture.Notifications.Verify(x => x.NotifyJobFailedAsync(It.Is<Lawyer.Core.Models.AiJob>(j => j.Id == job.Id)), Times.Once);
    }
}
