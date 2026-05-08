using Lawyer.Application.Common;

namespace Lawyer.Tests.Common;

public class PlainTextInputGuardTests
{
    [Theory]
    [InlineData("<script>alert(\"HACKED\")</script>")]
    [InlineData("javascript:alert(1)")]
    [InlineData("&lt;script&gt;alert(1)&lt;/script&gt;")]
    public void IsSafePlainText_RejectsHtmlAndScriptPayloads(string value)
    {
        PlainTextInputGuard.IsSafePlainText(value).Should().BeFalse();
    }

    [Fact]
    public void IsSafePlainText_AllowsNormalArabicName()
    {
        PlainTextInputGuard.IsSafePlainText("محمد أحمد").Should().BeTrue();
    }

    [Fact]
    public void NormalizePlainText_TrimsAndCollapsesWhitespace()
    {
        PlainTextInputGuard.NormalizePlainText("  محمد   أحمد  ").Should().Be("محمد أحمد");
    }
}
