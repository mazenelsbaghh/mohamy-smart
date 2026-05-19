using System.Linq.Expressions;
using FluentAssertions;
using Lawyer.Application.Common;
using Lawyer.Application.Dtos.AiPoints;
using Lawyer.Application.Dtos.Case;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Lawyer.Tests.Services;

public class ClarifyFactsServiceTests
{
    [Fact]
    public async Task EvaluateFactsGapsAsync_ShouldChargePoint_AfterQuestionsAreParsed()
    {
        var root = Path.Combine(Path.GetTempPath(), $"clarify-{Guid.NewGuid():N}");
        var promptsDir = Path.Combine(root, "wwwroot", "prompts", "Global");
        Directory.CreateDirectory(promptsDir);
        await File.WriteAllTextAsync(Path.Combine(promptsDir, "clarify-facts.txt"), "راجع الوقائع: {case_data}");

        var caseId = Guid.NewGuid();
        var lawyerId = Guid.NewGuid();
        var userId = Guid.NewGuid().ToString();
        var caseEntity = new Case
        {
            Id = caseId,
            LawyerId = lawyerId,
            CaseType = new CaseType { Id = 1, Title = "مدني" },
            Facts = "وقائع مكتوبة",
            ClientName = "المدعي",
            ApponentName = "المدعى عليه"
        };

        var caseRepo = new Mock<IGenericRepository<Case>>();
        caseRepo.Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<Case, bool>>>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<Expression<Func<Case, object>>[]>()))
            .ReturnsAsync(caseEntity);

        var unitOfWork = new Mock<IUnitOfWork>();
        unitOfWork.Setup(x => x.Repository<Case>()).Returns(caseRepo.Object);

        var access = new Mock<ICaseAccessValidator>();
        access.Setup(x => x.ValidateAsync(caseId, userId, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Result<bool>
            {
                Data = true,
                Succeeded = true,
                StatusCode = System.Net.HttpStatusCode.OK
            });

        var aiProvider = new Mock<IAIProvider>();
        aiProvider.Setup(x => x.SendChatCompletionAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.Is<AIRequestOptions>(o => o.MaxTokens == AIRequestOptions.GeminiMaxOutputTokens),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result<AIResponse>.Success(new AIResponse(
                """
                {"questions":[{"questionText":"هل يوجد عقد؟","suggestedOptions":["نعم","لا"]}]}
                """,
                new AIUsageMetadata(10, 20, 30))));

        var aiFactory = new Mock<IAIProviderFactory>();
        aiFactory.Setup(x => x.GetProvider()).Returns(aiProvider.Object);
        aiFactory.Setup(x => x.GetModelForStepAsync(AiStepType.ClarifyFacts)).ReturnsAsync("gemini-3.5-flash");

        var pointAccounting = new Mock<IAiPointAccountingService>();
        pointAccounting.Setup(x => x.ResolvePointCost(AiStepType.ClarifyFacts)).Returns(1);
        pointAccounting.Setup(x => x.ChargeSuccessfulDirectActionAsync(
                lawyerId,
                AiStepType.ClarifyFacts,
                1,
                caseId,
                "clarify-facts",
                null,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result<AiPointBalanceDto>.Success(new AiPointBalanceDto(10, 1, 0, 9, true, "ok")));

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                [WebHostDefaults.ContentRootKey] = root
            })
            .Build();

        try
        {
            var sut = new ClarifyFactsService(
                unitOfWork.Object,
                Mock.Of<ILogger<ClarifyFactsService>>(),
                aiFactory.Object,
                config,
                access.Object,
                Mock.Of<IAiUsageTrackingService>(),
                pointAccounting.Object,
                new PromptTemplateCache(root));

            var result = await sut.EvaluateFactsGapsAsync(new ClarifyFactsRequestDto { CaseId = caseId }, userId, CancellationToken.None);

            result.Succeeded.Should().BeTrue();
            result.Data!.Questions.Should().ContainSingle();
            pointAccounting.Verify(x => x.ChargeSuccessfulDirectActionAsync(
                lawyerId,
                AiStepType.ClarifyFacts,
                1,
                caseId,
                "clarify-facts",
                null,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()), Times.Once);
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }
}
