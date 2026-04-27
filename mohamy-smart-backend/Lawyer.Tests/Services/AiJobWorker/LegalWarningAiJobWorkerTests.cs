using FluentAssertions;
using Lawyer.Application.Dtos.LegalWarning;
using Lawyer.Core.Enum;
using Moq;

namespace Lawyer.Tests.Services.AiJobWorker;

public class LegalWarningAiJobWorkerTests
{
    [Theory]
    [InlineData(AiStepType.LegalWarningClassification, 1)]
    [InlineData(AiStepType.LegalWarningBodyDraft, 2)]
    [InlineData(AiStepType.LegalWarningAssembly, 3)]
    public async Task ProcessAsync_ShouldRouteLegalWarningSteps_ToLatestWorkflow(AiStepType stepType, int stepNumber)
    {
        using var fixture = new AiJobWorkerTestFixture();
        var caseId = Guid.NewGuid();
        var inputJson = $"{{\"step\":\"{stepType}\"}}";

        var job = await fixture.SeedJobAsync(stepType, caseId);
        await fixture.SeedLegalWarningWorkflowAsync(caseId, "lawyer-old", DateTime.UtcNow.AddMinutes(-10));
        var latestWorkflow = await fixture.SeedLegalWarningWorkflowAsync(caseId, "lawyer-new", DateTime.UtcNow);

        fixture.LegalWarningService
            .Setup(x => x.RunStepAsync(
                latestWorkflow.Id,
                stepNumber,
                It.Is<RunWarningStepRequest>(request => request.Input == inputJson),
                latestWorkflow.LawyerId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(AiJobWorkerTestFixture.Success(new { domain = "legal-warning", stepNumber }));

        var sut = fixture.CreateSut();

        await sut.ProcessAsync(job.Id, inputJson, CancellationToken.None);

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted.Should().NotBeNull();
        persisted!.Status.Should().Be(AiJobStatus.Completed);
        persisted.ErrorMessage.Should().BeNull();
        persisted.ResultJson.Should().Contain("legal-warning").And.Contain(stepNumber.ToString());

        fixture.LegalWarningService.VerifyAll();
    }

    [Fact]
    public async Task ProcessAsync_ShouldFailLegalWarningJob_WhenWorkflowIsMissing()
    {
        using var fixture = new AiJobWorkerTestFixture();
        var job = await fixture.SeedJobAsync(AiStepType.LegalWarningClassification);
        var sut = fixture.CreateSut();

        var action = () => sut.ProcessAsync(job.Id, "{\"caseId\":\"missing\"}", CancellationToken.None);

        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Failed to create and resolve workflow for Case*");

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Failed);
        persisted.ErrorMessage.Should().Be("حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");

        fixture.LegalWarningService.Verify(x => x.RunStepAsync(
            It.IsAny<int>(),
            It.IsAny<int>(),
            It.IsAny<RunWarningStepRequest>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ProcessAsync_ShouldPersistFailure_WhenLegalWarningServiceReturnsError()
    {
        using var fixture = new AiJobWorkerTestFixture();
        var caseId = Guid.NewGuid();
        var job = await fixture.SeedJobAsync(AiStepType.LegalWarningBodyDraft, caseId);
        var workflow = await fixture.SeedLegalWarningWorkflowAsync(caseId, "lawyer-1");

        fixture.LegalWarningService
            .Setup(x => x.RunStepAsync(
                workflow.Id,
                2,
                It.IsAny<RunWarningStepRequest>(),
                workflow.LawyerId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(AiJobWorkerTestFixture.Failure("legal warning failed"));

        var sut = fixture.CreateSut();

        var action = () => sut.ProcessAsync(job.Id, "{\"draft\":true}", CancellationToken.None);

        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("legal warning failed");

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Failed);
        persisted.ErrorMessage.Should().Be("حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }
}
