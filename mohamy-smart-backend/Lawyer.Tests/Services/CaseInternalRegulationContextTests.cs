using Lawyer.Application.Common;
using Lawyer.Core.Models;

namespace Lawyer.Tests.Services;

public class CaseInternalRegulationContextTests
{
    [Fact]
    public void BuildCaseContext_WithInternalRegulationsContext_AppendsRegulationText()
    {
        var caseEntity = new Case
        {
            ClientName = "أحمد",
            ApponentName = "شركة",
            Number = "123",
            Court = "محكمة القاهرة",
            Title = "نزاع مدني",
            Facts = "وقائع القضية",
            LegalClaims = "الطلبات",
            InternalRegulationsContext = "اللوائح الداخلية المرتبطة بالقضية:\n- العنوان: اللائحة الداخلية للشركة\n  النص:\nمادة 1"
        };

        var context = AnalysisHelpers.BuildCaseContext(caseEntity, "القانون المدني");

        context.Should().Contain("نوع القضية (حسب اختيار المحامي): القانون المدني");
        context.Should().Contain("اللوائح الداخلية المرتبطة بالقضية");
        context.Should().Contain("اللائحة الداخلية للشركة");
    }

    [Fact]
    public void BuildCaseContext_WithoutInternalRegulationsContext_KeepsExistingLawOnlyContext()
    {
        var caseEntity = new Case
        {
            ClientName = "أحمد",
            Title = "نزاع مدني",
            Facts = "وقائع القضية",
            LegalClaims = "الطلبات"
        };

        var context = AnalysisHelpers.BuildCaseContext(caseEntity, "القانون المدني");

        context.Should().Contain("نوع القضية (حسب اختيار المحامي): القانون المدني");
        context.Should().NotContain("اللوائح الداخلية المرتبطة بالقضية");
    }
}
