using System.Reflection;
using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Application.Services.SmartAnalysis;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Enum;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Lawyer.Tests.Services;

public class SmartAnalysisServiceTests
{
    [Fact]
    public void ParseCaseAnalysisJson_ShouldMapStringArrayPayload_ToLegalFactsSummary()
    {
        var sut = CreateSut();
        const string payload = """
            [
              "ثبت بالأوراق أن المدعي عضو بالجمعية العمومية.",
              "ورد بمحضر الواقعة أن المدعي تقدم بأوراق ترشحه.",
              "ثبت بالأوراق أن قرار الاستبعاد استند إلى سجل جنائي قديم."
            ]
            """;

        var result = InvokeParseCaseAnalysisJson(sut, payload);

        result.Should().NotBeNull();
        result!.LegalFactsSummary.Should().HaveCount(3);
        result.LegalFactsSummary.Should().ContainInOrder(
            "ثبت بالأوراق أن المدعي عضو بالجمعية العمومية.",
            "ورد بمحضر الواقعة أن المدعي تقدم بأوراق ترشحه.",
            "ثبت بالأوراق أن قرار الاستبعاد استند إلى سجل جنائي قديم.");
    }

    [Fact]
    public void ParseCaseAnalysisJson_ShouldMapWrappedStringArrayPayload_ToLegalFactsSummary()
    {
        var sut = CreateSut();
        const string payload = """
            {
              "analysis": [
                "ثبت بالأوراق سداد كافة المديونيات.",
                "ثبت بالأوراق حصول المدعي على رد اعتبار قضائي."
              ]
            }
            """;

        var result = InvokeParseCaseAnalysisJson(sut, payload);

        result.Should().NotBeNull();
        result!.LegalFactsSummary.Should().Equal(
            "ثبت بالأوراق سداد كافة المديونيات.",
            "ثبت بالأوراق حصول المدعي على رد اعتبار قضائي.");
    }

    [Fact]
    public void ParseCaseAnalysisJson_ShouldMapFullSchemaPayload_ToExpectedFields()
    {
        var sut = CreateSut();
        const string payload = """
            {
              "case_type": "جنحة مباشرة",
              "case_number": "١٢٣ لسنة ٢٠٢٥",
              "court_name": "محكمة جنح الرمل",
              "legal_facts_summary": [
                "ثبت بالأوراق أن المدعي أقام الدعوى بتاريخ ١ / ٢ / ٢٠٢٥."
              ],
              "opposing_parties_positions": [
                {
                  "party_name": "أحمد محمد",
                  "relationship_to_client": "المدعي في مواجهة موكلنا",
                  "position_summary": "يدعي الخصم إخلال موكلنا بالتزاماته التعاقدية."
                }
              ],
              "evidence_map": [
                {
                  "source": "عقد الاتفاق",
                  "proves": "يثبت وجود العلاقة التعاقدية بين الطرفين.",
                  "does_not_prove": "لا يثبت تحقق الإخلال المدعى به على وجه القطع.",
                  "limitations": "يخلو من بيان جزاءات تفصيلية عند الإخلال."
                }
              ],
              "legal_and_technical_review_points": [
                "عدم إرفاق ما يفيد إنذار موكلنا قبل إقامة الدعوى."
              ],
              "potential_legal_characterization": {
                "charge_description": "مطالبة مدنية ناشئة عن نزاع تعاقدي.",
                "elements_relied_upon": [
                  "وجود عقد مكتوب بين الطرفين."
                ],
                "elements_lacking_proof": [
                  "ثبوت الإخلال الجوهري المنسوب إلى موكلنا."
                ]
              }
            }
            """;

        var result = InvokeParseCaseAnalysisJson(sut, payload);

        result.Should().NotBeNull();
        result!.CaseType.Should().Be("جنحة مباشرة");
        result.CaseNumber.Should().Be("١٢٣ لسنة ٢٠٢٥");
        result.CourtName.Should().Be("محكمة جنح الرمل");
        result.DefendantsPositions.Should().ContainSingle();
        result.DefendantsPositions[0].DefendantName.Should().Be("أحمد محمد");
        result.DefendantsPositions[0].RelationshipToClient.Should().Be("المدعي في مواجهة موكلنا");
        result.DefendantsPositions[0].PositionSummary.Should().Be("يدعي الخصم إخلال موكلنا بالتزاماته التعاقدية.");
        result.EvidenceMap.Should().ContainSingle();
        result.LegalAndTechnicalReviewPoints.Should().ContainSingle();
        result.PotentialLegalCharacterization.ChargeDescription.Should().Be("مطالبة مدنية ناشئة عن نزاع تعاقدي.");
        result.PotentialLegalCharacterization.ElementsReliedUpon.Should().ContainSingle();
        result.PotentialLegalCharacterization.ElementsLackingProof.Should().ContainSingle();
    }

    [Fact]
    public async Task AnalyzeCaseFactsAsync_EmptyFacts_ReturnsValidationError()
    {
        var sut = CreateSut();
        var request = new CaseAnalysisRequestDto { CaseId = Guid.NewGuid(), CaseFacts = "" };

        var result = await sut.AnalyzeCaseFactsAsync(request, "user123", CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
        result.Message.Should().Be("وقائع القضية مطلوبة");
    }

    [Fact]
    public async Task AnalyzeCaseFactsAsync_JsonParseFailure_ReturnsFailure()
    {
        var caseId = Guid.NewGuid();
        var request = new CaseAnalysisRequestDto { CaseId = caseId, CaseFacts = "some facts" };

        var unitOfWorkMock = new Mock<IUnitOfWork>();
        var caseRepoMock = new Mock<IGenericRepository<Core.Models.Case>>();
        caseRepoMock.Setup(x => x.FirstOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Core.Models.Case, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<System.Linq.Expressions.Expression<Func<Core.Models.Case, object>>[]>()))
            .ReturnsAsync(new Core.Models.Case { Id = caseId, CaseTypeId = 1, LawyerId = Guid.NewGuid() });
        unitOfWorkMock.Setup(x => x.Repository<Core.Models.Case>()).Returns(caseRepoMock.Object);

        var caseTypeRepoMock = new Mock<IGenericRepository<Core.Models.CaseType>>();
        caseTypeRepoMock.Setup(x => x.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync(new Core.Models.CaseType { Id = 1 });
        unitOfWorkMock.Setup(x => x.Repository<Core.Models.CaseType>()).Returns(caseTypeRepoMock.Object);

        var accessValidatorMock = new Mock<ICaseAccessValidator>();
        accessValidatorMock.Setup(x => x.ValidateAsync(caseId, "user123", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Succeeded = true, Data = true, StatusCode = System.Net.HttpStatusCode.OK });

        var aiProviderMock = new Mock<IAIProvider>();
        aiProviderMock.Setup(x => x.SendChatCompletionAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<AIRequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Lawyer.Core.Exceptions.Result<AIResponse>.Success(new AIResponse("invalid json", null)));

        var aiFactoryMock = new Mock<IAIProviderFactory>();
        aiFactoryMock.Setup(x => x.GetProvider()).Returns(aiProviderMock.Object);
        aiFactoryMock.Setup(x => x.GetModelForStepAsync(It.IsAny<AiStepType>())).ReturnsAsync("model");

        var trackingMock = new Mock<IAiUsageTrackingService>();
        var sut = CreateSut(unitOfWorkMock.Object, aiFactoryMock.Object, accessValidatorMock.Object, trackingMock.Object);

        var promptDir = Path.Combine(AppContext.BaseDirectory, "wwwroot", "prompts", "المرحلة الأولى إعداد مذكرة الدفاع");
        Directory.CreateDirectory(promptDir);
        File.WriteAllText(Path.Combine(promptDir, "defense-step1-legal-analysis.txt"), "Dummy prompt template {case_type}");

        var userId = Guid.NewGuid().ToString();
        var result = await sut.AnalyzeCaseFactsAsync(request, userId, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.StatusCode.Should().Be(System.Net.HttpStatusCode.InternalServerError);
        result.Message.Should().Be("حدث خطأ أثناء تحليل القضية");
    }

    [Fact]
    public async Task AnalyzeCaseFactsAsync_HappyPath_ReturnsParsedDto()
    {
        var caseId = Guid.NewGuid();
        var request = new CaseAnalysisRequestDto { CaseId = caseId, CaseFacts = "some facts" };

        var unitOfWorkMock = new Mock<IUnitOfWork>();
        var caseRepoMock = new Mock<IGenericRepository<Core.Models.Case>>();
        caseRepoMock.Setup(x => x.FirstOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Core.Models.Case, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<System.Linq.Expressions.Expression<Func<Core.Models.Case, object>>[]>()))
            .ReturnsAsync(new Core.Models.Case { Id = caseId, CaseTypeId = 1, LawyerId = Guid.NewGuid() });
        unitOfWorkMock.Setup(x => x.Repository<Core.Models.Case>()).Returns(caseRepoMock.Object);

        var caseTypeRepoMock = new Mock<IGenericRepository<Core.Models.CaseType>>();
        caseTypeRepoMock.Setup(x => x.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync(new Core.Models.CaseType { Id = 1 });
        unitOfWorkMock.Setup(x => x.Repository<Core.Models.CaseType>()).Returns(caseTypeRepoMock.Object);

        var factAnalysisRepoMock = new Mock<IGenericRepository<Core.Models.FactAnalysis>>();
        factAnalysisRepoMock.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Core.Models.FactAnalysis, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Core.Models.FactAnalysis>());
        unitOfWorkMock.Setup(x => x.Repository<Core.Models.FactAnalysis>()).Returns(factAnalysisRepoMock.Object);

        var accessValidatorMock = new Mock<ICaseAccessValidator>();
        accessValidatorMock.Setup(x => x.ValidateAsync(caseId, It.IsAny<string>(), false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Lawyer.Core.Exceptions.Result<bool> { Succeeded = true, Data = true, StatusCode = System.Net.HttpStatusCode.OK });

        var aiProviderMock = new Mock<IAIProvider>();
        const string validJson = """
            {
              "legal_facts_summary": ["Fact 1", "Fact 2"],
              "opposing_parties_positions": [{"party_name": "X", "relationship_to_client": "Y", "position_summary": "Z"}],
              "evidence_map": [{"source": "Doc", "proves": "Fact"}],
              "legal_and_technical_review_points": ["Point 1"]
            }
            """;
        aiProviderMock.Setup(x => x.SendChatCompletionAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<AIRequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Lawyer.Core.Exceptions.Result<AIResponse>.Success(new AIResponse(validJson, new AIUsageMetadata(10, 10, 20))));

        var aiFactoryMock = new Mock<IAIProviderFactory>();
        aiFactoryMock.Setup(x => x.GetProvider()).Returns(aiProviderMock.Object);
        aiFactoryMock.Setup(x => x.GetModelForStepAsync(It.IsAny<AiStepType>())).ReturnsAsync("model");

        var trackingMock = new Mock<IAiUsageTrackingService>();

        var transactionMock = new Mock<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction>();
        unitOfWorkMock.Setup(x => x.BeginTransactionAsync()).ReturnsAsync(transactionMock.Object);
        unitOfWorkMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var sut = CreateSut(unitOfWorkMock.Object, aiFactoryMock.Object, accessValidatorMock.Object, trackingMock.Object);

        var promptDir = Path.Combine(AppContext.BaseDirectory, "wwwroot", "prompts", "المرحلة الأولى إعداد مذكرة الدفاع");
        Directory.CreateDirectory(promptDir);
        File.WriteAllText(Path.Combine(promptDir, "defense-step1-legal-analysis.txt"), "Dummy prompt template {case_type}");

        var userId = Guid.NewGuid().ToString();
        var result = await sut.AnalyzeCaseFactsAsync(request, userId, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.LegalFactsSummary.Should().ContainInOrder("Fact 1", "Fact 2");
    }

    private static FactAnalysisService CreateSut(
        IUnitOfWork? unitOfWork = null, 
        IAIProviderFactory? aiFactory = null, 
        ICaseAccessValidator? accessValidator = null,
        IAiUsageTrackingService? trackingService = null)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                [WebHostDefaults.ContentRootKey] = AppContext.BaseDirectory
            })
            .Build();

        var promptCache = new Lawyer.Application.Common.PromptTemplateCache(AppContext.BaseDirectory);
        var hostEnvMock = new Mock<Microsoft.Extensions.Hosting.IHostEnvironment>();
        hostEnvMock.Setup(x => x.ContentRootPath).Returns(AppContext.BaseDirectory);
        var promptService = new Lawyer.Application.Services.SmartAnalysis.PromptService(promptCache, hostEnvMock.Object);

        return new FactAnalysisService(
            unitOfWork ?? new Mock<IUnitOfWork>().Object,
            new Mock<ILogger<FactAnalysisService>>().Object,
            aiFactory ?? new Mock<IAIProviderFactory>().Object,
            accessValidator ?? new Mock<ICaseAccessValidator>().Object,
            trackingService ?? new Mock<IAiUsageTrackingService>().Object,
            promptService);
    }

    private static CaseAnalysisResultDto? InvokeParseCaseAnalysisJson(FactAnalysisService sut, string payload)
    {
        var method = typeof(FactAnalysisService).GetMethod(
            "ParseCaseAnalysisJson",
            BindingFlags.Instance | BindingFlags.NonPublic);

        method.Should().NotBeNull();
        return (CaseAnalysisResultDto?)method!.Invoke(sut, [payload]);
    }
}
