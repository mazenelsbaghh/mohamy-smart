using FluentAssertions;
using Lawyer.Application.Dtos.Case;
using Lawyer.Application.Dtos.ExecRequest;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Moq;

namespace Lawyer.Tests.Services.AiJobWorker;

public class AiJobWorkerErrorHandlingTests
{
    [Fact]
    public async Task ProcessAsync_ShouldPersistFailure_WhenStepTypeIsStillUnsupported()
    {
        using var fixture = new AiJobWorkerTestFixture();
        var job = await fixture.SeedJobAsync(AiStepType.Ocr);
        fixture.CaseOcrService
            .Setup(x => x.GenerateCaseFromTextAsync(It.IsAny<string>(), It.IsAny<List<AvailableCaseTypeDto>>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("ocr explosion"));
        var sut = fixture.CreateSut();

        await Assert.ThrowsAsync<Exception>(() =>
            sut.ProcessAsync(job.Id, "{}", CancellationToken.None));

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Failed);
        persisted.ErrorMessage.Should().Be("حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");

        fixture.Notifications.Verify(x => x.NotifyJobFailedAsync(It.Is<Lawyer.Core.Models.AiJob>(j => j.Id == job.Id)), Times.Once);
    }

    [Fact]
    public async Task ProcessAsync_ShouldPersistFailure_WhenDomainServiceThrows()
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
            .ThrowsAsync(new Exception("domain explosion"));

        var sut = fixture.CreateSut();

        await Assert.ThrowsAsync<Exception>(() =>
            sut.ProcessAsync(job.Id, "{\"drafting\":true}", CancellationToken.None));

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Failed);
        persisted.ErrorMessage.Should().Be("حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");

        fixture.Notifications.Verify(x => x.NotifyJobFailedAsync(It.Is<Lawyer.Core.Models.AiJob>(j => j.Id == job.Id)), Times.Once);
    }

    [Fact]
    public async Task ProductionRegression_20260623_SuccessfulRetry_ClearsPreviousFailureDetails()
    {
        using var fixture = new AiJobWorkerTestFixture();
        var caseId = Guid.NewGuid();
        var job = await fixture.SeedJobAsync(AiStepType.ExecRequestDrafting, caseId);
        var workflow = await fixture.SeedExecRequestWorkflowAsync(caseId, "lawyer-1");
        job.Status = AiJobStatus.Failed;
        job.ErrorCode = "ProviderTimeout";
        job.ErrorMessage = "previous failure";
        await fixture.DbContext.SaveChangesAsync();
        fixture.ExecRequestService
            .Setup(x => x.RunStepAsync(
                workflow.Id,
                2,
                It.IsAny<RunExecStepRequest>(),
                workflow.LawyerId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(AiJobWorkerTestFixture.Success(new { drafted = true }));

        await fixture.CreateSut().ProcessAsync(job.Id, "{\"drafting\":true}", CancellationToken.None);

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Completed);
        persisted.ErrorCode.Should().BeNull();
        persisted.ErrorMessage.Should().BeNull();
        persisted.ResultJson.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task ProductionRegression_20260623_ProviderTimeout_PersistsDiagnosticErrorCode()
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
            .ReturnsAsync(AiJobWorkerTestFixture.Failure("AI provider request timed out."));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            fixture.CreateSut().ProcessAsync(job.Id, "{\"drafting\":true}", CancellationToken.None));

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Failed);
        persisted.ErrorCode.Should().Be("ProviderTimeout");
        persisted.ErrorMessage.Should().Be("حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }

    [Fact]
    public async Task ProcessAsync_ShouldMarkJobAsConflict_WhenWorkflowConcurrencyExceptionRetriesExhaust()
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
            .ThrowsAsync(new WorkflowConcurrencyException("concurrency"));

        var sut = fixture.CreateSut();

        await sut.ProcessAsync(job.Id, "{\"drafting\":true}", CancellationToken.None);

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Conflict);
        persisted.ErrorMessage.Should().Be("تم تحديث سير العمل أثناء تنفيذ التحليل. يرجى إعادة تحميل الصفحة ثم إعادة المحاولة.");
    }
}
