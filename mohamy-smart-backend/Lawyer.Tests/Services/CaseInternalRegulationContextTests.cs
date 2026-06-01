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

    [Fact]
    public void BuildCaseContext_ForClientDefense_IncludesExplicitRepresentationGuard()
    {
        var caseEntity = new Case
        {
            ClientName = "أحمد",
            ApponentName = "شركة النور",
            DefendingParty = "client"
        };

        var context = AnalysisHelpers.BuildCaseContext(caseEntity, "مدني");

        context.Should().Contain("موكل المكتب/المحامي المسجل في القضية: أحمد");
        context.Should().Contain("الخصم/الطرف المقابل المسجل في القضية: شركة النور");
        context.Should().Contain("الطرف الذي يجب حماية موقفه والدفاع عنه في هذا المسار: أحمد");
        context.Should().Contain("الطرف المقابل لهذا المسار: شركة النور");
        context.Should().Contain("لا تنشئ دفوعًا أو طلبات أو صياغات تضر بالطرف الذي يجب حماية موقفه");
    }

    [Fact]
    public void BuildCaseContext_ForOpponentDefense_UsesOpponentAsRepresentedParty()
    {
        var caseEntity = new Case
        {
            ClientName = "أحمد",
            ApponentName = "شركة النور",
            DefendingParty = "opponent"
        };

        var context = AnalysisHelpers.BuildCaseContext(caseEntity, "مدني");

        context.Should().Contain("موكل المكتب/المحامي المسجل في القضية: أحمد");
        context.Should().Contain("الطرف الذي يجب حماية موقفه والدفاع عنه في هذا المسار: شركة النور");
        context.Should().Contain("الطرف المقابل لهذا المسار: أحمد");
        context.Should().Contain("الطرف المُمَثَّل: الخصم/الطرف الآخر (شركة النور)");
    }
}
