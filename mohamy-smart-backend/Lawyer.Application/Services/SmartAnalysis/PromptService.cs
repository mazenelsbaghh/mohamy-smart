using Lawyer.Application.Common;
using Lawyer.Application.IServices;
using Microsoft.Extensions.Hosting;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace Lawyer.Application.Services.SmartAnalysis
{
    public class PromptService : IPromptService
    {
        private readonly PromptTemplateCache _promptCache;
        private readonly string _contentRootPath;

        private static readonly Regex IgnoreInstructionsRegex = new(
            @"(?im)^.*ignore\s+(previous|all)\s+instructions.*$",
            RegexOptions.Compiled);

        private static readonly Regex PlaceholderTokenRegex = new(
            @"\{[a-z_]+\}",
            RegexOptions.Compiled);

        private const int MaxSanitizedPromptInputLength = 200_000;

        public const int MaxOutputListLength = 200;
        public const int MaxOutputStringLength = 2000;

        public PromptService(PromptTemplateCache promptCache, IHostEnvironment env)
        {
            _promptCache = promptCache;
            _contentRootPath = env.ContentRootPath;
        }

        public async Task<string?> GetPromptIfExistsAsync(string relativePath, CancellationToken ct)
        {
            var fullPath = Path.Combine(_contentRootPath, "wwwroot", "prompts", relativePath);
            if (!File.Exists(fullPath))
                return null;
            return await _promptCache.GetAsync(relativePath, ct);
        }

        public static string SanitizePromptInput(string? raw)
        {
            if (string.IsNullOrEmpty(raw))
                return "<user_facts></user_facts>";

            var stripped = IgnoreInstructionsRegex.Replace(raw, string.Empty);
            stripped = PlaceholderTokenRegex.Replace(stripped, string.Empty);
            if (stripped.Length > MaxSanitizedPromptInputLength)
                stripped = stripped[..MaxSanitizedPromptInputLength];
            return $"<user_facts>\n{stripped}\n</user_facts>";
        }

        public static string RedactForLog(string raw)
        {
            if (string.IsNullOrEmpty(raw)) return "(empty)";
            var preview = raw[..Math.Min(500, raw.Length)];
            var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw)))[..16];
            return $"{preview}... [SHA256:{hash}] (len={raw.Length})";
        }

        public static string SnakeToCamel(string key)
        {
            if (string.IsNullOrWhiteSpace(key) || !key.Contains('_'))
                return key;

            var parts = key.Split('_', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 0) return key;

            return parts[0] + string.Concat(parts.Skip(1).Select(part =>
                char.ToUpperInvariant(part[0]) + part.Substring(1)));
        }

        public static JsonNode? NormalizeJsonKeys(JsonNode? node)
        {
            return node switch
            {
                null => null,
                JsonObject obj => new JsonObject(
                    obj.Select(kvp => new KeyValuePair<string, JsonNode?>(
                        SnakeToCamel(kvp.Key),
                        NormalizeJsonKeys(kvp.Value)))
                ),
                JsonArray array => new JsonArray(array.Select(NormalizeJsonKeys).ToArray()),
                _ => node.DeepClone()
            };
        }

        public static T? DeserializeSnakeOrCamelJson<T>(string jsonText) where T : class
        {
            var node = JsonNode.Parse(jsonText);
            var normalized = NormalizeJsonKeys(node);
            if (normalized is null)
                return null;

            return normalized.Deserialize<T>(JsonOptions.Deserialize);
        }
    }
}
