using System.Text.RegularExpressions;

namespace Lawyer.Application.Common
{
    public static partial class PlainTextInputGuard
    {
        public static bool IsSafePlainText(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return true;

            return !HtmlLikePattern().IsMatch(value) &&
                   !DangerousProtocolPattern().IsMatch(value);
        }

        public static string NormalizePlainText(string value)
        {
            return WhitespacePattern().Replace(value.Trim(), " ");
        }

        [GeneratedRegex(@"<[^>]+>|&(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);", RegexOptions.Compiled)]
        private static partial Regex HtmlLikePattern();

        [GeneratedRegex(@"\b(?:javascript|data|vbscript)\s*:", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
        private static partial Regex DangerousProtocolPattern();

        [GeneratedRegex(@"\s+", RegexOptions.Compiled)]
        private static partial Regex WhitespacePattern();
    }
}
