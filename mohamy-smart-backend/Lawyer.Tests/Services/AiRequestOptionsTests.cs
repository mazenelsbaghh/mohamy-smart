using FluentAssertions;
using Lawyer.Application.IServices.AI;
using Xunit;

namespace Lawyer.Tests.Services;

public class AiRequestOptionsTests
{
    [Fact]
    public void Presets_ShouldUseGeminiMaximumOutputTokens()
    {
        AIRequestOptions.GeminiMaxOutputTokens.Should().Be(65_536);
        AIRequestOptions.Default.MaxTokens.Should().Be(AIRequestOptions.GeminiMaxOutputTokens);
        AIRequestOptions.ForAnalysis.MaxTokens.Should().Be(AIRequestOptions.GeminiMaxOutputTokens);
        AIRequestOptions.ForDefenses.MaxTokens.Should().Be(AIRequestOptions.GeminiMaxOutputTokens);
        AIRequestOptions.ForDefenseAnalysis.MaxTokens.Should().Be(AIRequestOptions.GeminiMaxOutputTokens);
        AIRequestOptions.ForFinalRequirements.MaxTokens.Should().Be(AIRequestOptions.GeminiMaxOutputTokens);
        AIRequestOptions.ForContractDraft.MaxTokens.Should().Be(AIRequestOptions.GeminiMaxOutputTokens);
    }
}
