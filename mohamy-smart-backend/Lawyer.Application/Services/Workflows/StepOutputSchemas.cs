using System;
using System.Text.Json;
using Lawyer.Application.Common;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.Services.Workflows
{
    public static class StepOutputSchemas
    {
        public static object Normalize(int stepTypeAsInt, string rawAiOutput, string? workflowType = null)
        {
            var cleanJson = AnalysisHelpers.CleanJsonResponse(rawAiOutput);
            try
            {
                cleanJson = NormalizeNamingConvention(cleanJson);

                switch (stepTypeAsInt)
                {
                    case 1: return ValidateAndParse<FactAnalysisStepOutput>(cleanJson, stepTypeAsInt, workflowType);
                    case 2: return ValidateAndParse<GenerateDefensesStepOutput>(cleanJson, stepTypeAsInt, workflowType);
                    case 3: return ValidateAndParse<AnalysisDefenseStepOutput>(cleanJson, stepTypeAsInt, workflowType);
                    case 4: return ValidateAndParse<FinalRequirementsStepOutput>(cleanJson, stepTypeAsInt, workflowType);

                    case 10: return ValidateAndParse<LawsuitCaseTypeStepOutput>(cleanJson, stepTypeAsInt, workflowType);
                    case 11: return ValidateAndParse<LawsuitPartiesStepOutput>(cleanJson, stepTypeAsInt, workflowType);
                    case 12: return ValidateAndParse<LawsuitSubjectsStepOutput>(cleanJson, stepTypeAsInt, workflowType);
                    case 13: return ValidateAndParse<LawsuitFactsStepOutput>(cleanJson, stepTypeAsInt, workflowType);
                    case 14: return ValidateAndParse<LawsuitLegalBasisStepOutput>(cleanJson, stepTypeAsInt, workflowType);
                    case 15: return ValidateAndParse<LawsuitRequestsStepOutput>(cleanJson, stepTypeAsInt, workflowType);

                    case 40:
                    case 41:
                    case 42:
                    case 43:
                    case 44:
                    case 45: return ValidateAndParse<AppealBriefStepOutput>(cleanJson, stepTypeAsInt, workflowType);

                    case 50:
                    case 51:
                    case 52:
                    case 53:
                    case 54: return ValidateAndParse<AdminComplaintStepOutput>(cleanJson, stepTypeAsInt, workflowType);

                    case 60: return ValidateAndParse<RulingStep1Output>(cleanJson, stepTypeAsInt, workflowType);
                    case 61: return ValidateAndParse<RulingStep2Output>(cleanJson, stepTypeAsInt, workflowType);
                    case 62: return ValidateAndParse<RulingStep3Output>(cleanJson, stepTypeAsInt, workflowType);
                    case 63: return ValidateAndParse<RulingStep4Output>(cleanJson, stepTypeAsInt, workflowType);

                    case 70:
                    case 71:
                    case 72: return ValidateAndParse<LegalWarningStepOutput>(cleanJson, stepTypeAsInt, workflowType);

                    case 80:
                    case 81:
                    case 82: return ValidateAndParse<ExecRequestStepOutput>(cleanJson, stepTypeAsInt, workflowType);

                    default:
                        var wt = workflowType ?? "unknown";
                        throw new SchemaValidationException(wt, stepTypeAsInt, $"Unknown step type: {stepTypeAsInt}", cleanJson);
                }
            }
            catch (JsonException ex)
            {
                var wt = workflowType ?? "unknown";
                var rawTruncated = cleanJson?.Length > 2000 ? cleanJson[..2000] : cleanJson;
                throw new SchemaValidationException(wt, stepTypeAsInt, "تعذر تحليل البيانات المستخرجة من الذكاء الاصطناعي.", rawTruncated);
            }
            catch (SchemaValidationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                var wt = workflowType ?? "unknown";
                var rawTruncated = cleanJson?.Length > 2000 ? cleanJson[..2000] : cleanJson;
                throw new SchemaValidationException(wt, stepTypeAsInt, "حدث خطأ غير متوقع أثناء معالجة بيانات الذكاء الاصطناعي.", rawTruncated);
            }
        }

        private static string NormalizeNamingConvention(string cleanJson)
        {
            using var doc = JsonDocument.Parse(cleanJson);
            bool hasUnderscore = false;
            foreach (var prop in doc.RootElement.EnumerateObject())
            {
                if (prop.Name.Contains('_'))
                {
                    hasUnderscore = true;
                    break;
                }
            }
            if (hasUnderscore)
            {
                return JsonSerializer.Serialize(doc.RootElement, Common.JsonOptions.Serialize);
            }
            return cleanJson;
        }

        private static T ValidateAndParse<T>(string json, int stepType, string? workflowType) where T : new()
        {
            var result = JsonSerializer.Deserialize<T>(json, Common.JsonOptions.Deserialize);
            if (result == null)
            {
                var wt = workflowType ?? "unknown";
                throw new SchemaValidationException(wt, stepType, $"AI output is structurally valid JSON but contains no expected fields for step type {stepType}", json);
            }
            return result;
        }
    }
}
