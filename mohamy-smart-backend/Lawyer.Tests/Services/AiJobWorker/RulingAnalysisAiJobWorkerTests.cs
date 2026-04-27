using FluentAssertions;
using Lawyer.Application.Dtos.RulingAnalysis;
using Lawyer.Core.Enum;
using Moq;

namespace Lawyer.Tests.Services.AiJobWorker;

public class RulingAnalysisAiJobWorkerTests
{
    [Theory]
    [InlineData(AiStepType.RulingAnalysisOperative, 1)]
    [InlineData(AiStepType.RulingAnalysisReasoning, 2)]
    [InlineData(AiStepType.RulingAnalysisDefectEvaluation, 3)]
    [InlineData(AiStepType.RulingAnalysisFeasibilityReport, 4)]
    public async Task ProcessAsync_ShouldRouteRulingAnalysisSteps_ToLatestWorkflow(AiStepType stepType, int stepNumber)
    {
        using var fixture = new AiJobWorkerTestFixture();
        var caseId = Guid.NewGuid();
        var inputJson = $"{{\"step\":\"{stepType}\"}}";

        var job = await fixture.SeedJobAsync(stepType, caseId);
        await fixture.SeedRulingAnalysisWorkflowAsync(caseId, "lawyer-old", DateTime.UtcNow.AddMinutes(-5));
        var latestWorkflow = await fixture.SeedRulingAnalysisWorkflowAsync(caseId, "lawyer-new", DateTime.UtcNow);

        fixture.RulingAnalysisService
            .Setup(x => x.RunStepAsync(
                latestWorkflow.Id,
                stepNumber,
                It.Is<RunRulingStepRequest>(request => request.Input == inputJson),
                latestWorkflow.LawyerId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(AiJobWorkerTestFixture.Success(new { domain = "ruling-analysis", stepNumber }));

        var sut = fixture.CreateSut();

        await sut.ProcessAsync(job.Id, inputJson, CancellationToken.None);

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Completed);
        persisted.ResultJson.Should().Contain("ruling-analysis").And.Contain(stepNumber.ToString());

        fixture.RulingAnalysisService.VerifyAll();
    }

    [Fact]
    public async Task ProcessAsync_ShouldFailRulingAnalysisJob_WhenWorkflowIsMissing()
    {
        using var fixture = new AiJobWorkerTestFixture();
        var job = await fixture.SeedJobAsync(AiStepType.RulingAnalysisOperative);
        var sut = fixture.CreateSut();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            sut.ProcessAsync(job.Id, "{\"operative\":true}", CancellationToken.None));

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Failed);
        persisted.ErrorMessage.Should().Be("حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }

    [Fact]
    public async Task ProcessAsync_ShouldPersistFailure_WhenRulingAnalysisServiceReturnsError()
    {
        using var fixture = new AiJobWorkerTestFixture();
        var caseId = Guid.NewGuid();
        var job = await fixture.SeedJobAsync(AiStepType.RulingAnalysisFeasibilityReport, caseId);
        var workflow = await fixture.SeedRulingAnalysisWorkflowAsync(caseId, "lawyer-1");

        fixture.RulingAnalysisService
            .Setup(x => x.RunStepAsync(
                workflow.Id,
                4,
                It.IsAny<RunRulingStepRequest>(),
                workflow.LawyerId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(AiJobWorkerTestFixture.Failure("ruling analysis failed"));

        var sut = fixture.CreateSut();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            sut.ProcessAsync(job.Id, "{\"appeal\":true}", CancellationToken.None));

        var persisted = await fixture.DbContext.AiJobs.FindAsync(job.Id);
        persisted!.Status.Should().Be(AiJobStatus.Failed);
        persisted.ErrorMessage.Should().Be("حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
    }
}
