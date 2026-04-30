using System;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Lawyer.Core.Models;
using Lawyer.Application.Services.Workflows;

namespace Lawyer.Application.Common
{
    public static class AnalysisHelpers
    {
        public static string CleanJsonResponse(string? jsonText)
        {
            if (string.IsNullOrWhiteSpace(jsonText)) return string.Empty;
            jsonText = jsonText.Trim();
            if (jsonText.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
                jsonText = jsonText.Substring(7);
            else if (jsonText.StartsWith("```", StringComparison.OrdinalIgnoreCase))
                jsonText = jsonText.Substring(3);

            if (jsonText.EndsWith("```", StringComparison.OrdinalIgnoreCase))
                jsonText = jsonText.Substring(0, jsonText.Length - 3);

            return jsonText.Trim();
        }

        public static bool IsValidJson(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return false;
            try
            {
                using var _ = JsonDocument.Parse(text);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static string TryExtractJsonPayload(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;

            text = text.Trim();
            
            var match = Regex.Match(text, @"```(?:json)?\s*([\s\S]*?)\s*```", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                var candidateBlock = match.Groups[1].Value.Trim();
                if (IsValidJson(candidateBlock)) return candidateBlock;
            }

            if (IsValidJson(text)) return text;

            var objectStart = text.IndexOf('{');
            if (objectStart >= 0)
            {
                int braceCount = 0;
                for (int i = objectStart; i < text.Length; i++)
                {
                    if (text[i] == '{') braceCount++;
                    else if (text[i] == '}') braceCount--;

                    if (braceCount == 0)
                    {
                        var candidate = text.Substring(objectStart, i - objectStart + 1).Trim();
                        if (IsValidJson(candidate)) return candidate;
                        break;
                    }
                }
                
                var objectEnd = text.LastIndexOf('}');
                if (objectEnd > objectStart)
                {
                    var candidate = text.Substring(objectStart, objectEnd - objectStart + 1).Trim();
                    if (IsValidJson(candidate)) return candidate;
                }

                var candidateRepair = RepairTruncatedJson(text.Substring(objectStart).Trim());
                if (IsValidJson(candidateRepair)) return candidateRepair;
            }

            var arrayStart = text.IndexOf('[');
            if (arrayStart >= 0)
            {
                int bracketCount = 0;
                for (int i = arrayStart; i < text.Length; i++)
                {
                    if (text[i] == '[') bracketCount++;
                    else if (text[i] == ']') bracketCount--;

                    if (bracketCount == 0)
                    {
                        var candidate = text.Substring(arrayStart, i - arrayStart + 1).Trim();
                        if (IsValidJson(candidate)) return candidate;
                        break;
                    }
                }
                
                var arrayEnd = text.LastIndexOf(']');
                if (arrayEnd > arrayStart)
                {
                    var candidate = text.Substring(arrayStart, arrayEnd - arrayStart + 1).Trim();
                    if (IsValidJson(candidate)) return candidate;
                }

                var candidateRepair = RepairTruncatedJson(text.Substring(arrayStart).Trim());
                if (IsValidJson(candidateRepair)) return candidateRepair;
            }

            var cleanedText = CleanJsonResponse(text);
            var repaired = RepairTruncatedJson(cleanedText);
            if (IsValidJson(repaired)) return repaired;

            return text;
        }

        public static string RepairTruncatedJson(string json)
        {
            if (string.IsNullOrWhiteSpace(json)) return json;

            try
            {
                using var _ = JsonDocument.Parse(json);
                return json;
            }
            catch { }

            int closeBraces = 0, closeBrackets = 0;
            bool inStr = false, escape = false;
            foreach (char c in json)
            {
                if (escape) { escape = false; continue; }
                if (c == '\\') { escape = true; continue; }
                if (c == '"') { inStr = !inStr; continue; }
                if (inStr) continue;
                if (c == '{') closeBraces++;
                else if (c == '}') closeBraces--;
                else if (c == '[') closeBrackets++;
                else if (c == ']') closeBrackets--;
            }

            if (inStr) json += "\"";
            while (closeBrackets > 0) { json += "]"; closeBrackets--; }
            while (closeBraces > 0) { json += "}"; closeBraces--; }

            return json;
        }

        public static object DeserializeOutput(string normalizedJson)
        {
            return StepOutputSchemas.Normalize(0, normalizedJson);
        }

        public static object DeserializeOutput(int stepType, string rawAiOutput)
        {
            return StepOutputSchemas.Normalize(stepType, rawAiOutput);
        }

        public static string BuildCaseContext(Case c, string? caseTypeName = null)
        {
            var sb = new StringBuilder();
            if (!string.IsNullOrWhiteSpace(c.ClientName))
                sb.AppendLine($"اسم الموكل: {c.ClientName}");
            if (!string.IsNullOrWhiteSpace(c.ApponentName))
                sb.AppendLine($"اسم الجهة أو الخصم: {c.ApponentName}");
            if (!string.IsNullOrWhiteSpace(c.DefendingParty))
                sb.AppendLine($"الطرف المُمَثَّل: {(c.DefendingParty == "client" ? "الموكل (مدعي/مدعى عليه)" : c.DefendingParty)}");
            if (!string.IsNullOrWhiteSpace(c.Number))
                sb.AppendLine($"رقم القضية: {c.Number}");
            if (!string.IsNullOrWhiteSpace(c.Court))
                sb.AppendLine($"الجهة/المحكمة: {c.Court}");
            if (!string.IsNullOrWhiteSpace(c.Title))
                sb.AppendLine($"عنوان القضية: {c.Title}");
            // Use navigation property if loaded, otherwise fall back to resolved name
            var resolvedTypeName = c.CaseType?.Title ?? caseTypeName;
            if (!string.IsNullOrWhiteSpace(resolvedTypeName))
                sb.AppendLine($"نوع القضية (حسب اختيار المحامي): {resolvedTypeName}");
            if (!string.IsNullOrWhiteSpace(c.Description))
                sb.AppendLine($"وصف/تفاصيل القضية: {c.Description}");
            if (!string.IsNullOrWhiteSpace(c.Facts))
                sb.AppendLine($"وقائع القضية: {c.Facts}");
            if (!string.IsNullOrWhiteSpace(c.LegalClaims))
                sb.AppendLine($"الطلبات أو الغاية القانونية: {c.LegalClaims}");
            return sb.ToString().Trim();
        }
        public static string BuildPreviousStepsContext<TWorkflow>(TWorkflow workflow, int currentStep) where TWorkflow : WorkflowBase
        {
            var sb = new StringBuilder();
            for (int i = 1; i < currentStep; i++)
            {
                var output = workflow.GetStepOutput(i);
                if (!string.IsNullOrWhiteSpace(output))
                {
                    sb.AppendLine($"الخطوة {i}: {output}");
                }
            }
            return sb.ToString().Trim();
        }
    }
}
