using Lawyer.Application.Common.Interface;
using Lawyer.Application.Services;
using Lawyer.Core.Enum;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Lawyer.Tests.Services;

public class AiModelConfigServiceTests
{
    [Fact]
    public void GetAvailableModels_IncludesGemini35FlashMetadata()
    {
        var sut = new AiModelConfigService(
            Mock.Of<IApplicationDbContext>(),
            new MemoryCache(new MemoryCacheOptions()),
            Mock.Of<ILogger<AiModelConfigService>>());

        var result = sut.GetAvailableModels();

        result.Succeeded.Should().BeTrue();
        var model = result.Data.Should().ContainSingle(m => m.Identifier == "gemini-3.5-flash").Subject;
        model.DisplayName.Should().Be("Gemini 3.5 Flash");
        model.DocumentationUrl.Should().Be("https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash");
        model.PricingNotes.Should().Contain("$1.50/1M tokens");
        model.PricingNotes.Should().Contain("$9.00/1M tokens");
    }

    [Fact]
    public void ValidModelIdentifiers_IncludesGemini35Flash()
    {
        AiModelTypeExtensions.ValidModelIdentifiers.Should().Contain("gemini-3.5-flash");
        AiModelType.Gemini35Flash.ToModelIdentifier().Should().Be("gemini-3.5-flash");
        AiModelTypeExtensions.ToModelDisplayName("gemini-3.5-flash").Should().Be("Gemini 3.5 Flash");
    }
}
