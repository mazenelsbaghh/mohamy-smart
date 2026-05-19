using Lawyer.Core.Enum;

namespace Lawyer.Application.Services
{
    public static class AiCostCalculator
    {
        private static readonly Dictionary<string, (decimal Input, decimal Output)> Pricing = new()
        {
            ["gemini-3.1-pro-preview"] = (2.00m / 1_000_000, 12.00m / 1_000_000),
            ["gemini-3-flash-preview"] = (0.50m / 1_000_000, 3.00m / 1_000_000),
            ["gemini-3.1-flash-lite-preview"] = (0.25m / 1_000_000, 1.50m / 1_000_000),
            ["gemini-3.5-flash"] = (1.50m / 1_000_000, 9.00m / 1_000_000),
        };

        private const decimal GoogleVisionPerCall = 1.50m / 1000;

        public static decimal CalculateGeminiCost(string modelIdentifier, int inputTokens, int outputTokens)
        {
            var key = Pricing.Keys.FirstOrDefault(k =>
                modelIdentifier.Contains(k, StringComparison.OrdinalIgnoreCase))
                ?? "gemini-3.5-flash";

            var (inputPrice, outputPrice) = Pricing[key];
            return (inputTokens * inputPrice) + (outputTokens * outputPrice);
        }

        public static decimal CalculateOcrCost() => GoogleVisionPerCall;

        public static string GetModelDisplayName(string modelIdentifier)
        {
            if (modelIdentifier.Contains("pro", StringComparison.OrdinalIgnoreCase))
                return "Gemini 3.1 Pro";
            if (modelIdentifier.Contains("gemini-3.5-flash", StringComparison.OrdinalIgnoreCase))
                return "Gemini 3.5 Flash";
            if (modelIdentifier.Contains("flash-lite", StringComparison.OrdinalIgnoreCase))
                return "Gemini 3.1 Flash Lite";
            if (modelIdentifier.Contains("flash", StringComparison.OrdinalIgnoreCase))
                return "Gemini 3 Flash";
            return modelIdentifier;
        }
    }
}
