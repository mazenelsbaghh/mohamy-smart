using System.Text.Json.Serialization;

namespace Lawyer.Application.Dtos.PreparingStatementOfClaims
{
    /// <summary>
    /// Aggregated summary of all PrepStatements step outputs for a given case.
    /// Property names use [JsonPropertyName("stepNOutput")] to match the format
    /// expected by the unified frontend createWorkflowSlice hydrator.
    /// </summary>
    public class StatementOfClaimsSummaryDto
    {
        public Guid CaseId { get; set; }

        /// <summary>Current highest completed step (1-7). 0 means nothing started.</summary>
        public int CurrentStep { get; set; }

        /// <summary>"InProgress" | "Completed" | "NotStarted"</summary>
        public string Status { get; set; } = "NotStarted";

        public DateTime? UpdatedAt { get; set; }

        [JsonPropertyName("step1Output")]
        public LawSuitCaseTypeResponseDto? Step1Output { get; set; }

        [JsonPropertyName("step2Output")]
        public LawSuitPartiesResponseDto? Step2Output { get; set; }

        [JsonPropertyName("step3Output")]
        public LawSuitSubjectsResponseDto? Step3Output { get; set; }

        [JsonPropertyName("step4Output")]
        public LawSuitFactsResponseDto? Step4Output { get; set; }

        [JsonPropertyName("step5Output")]
        public LawSuitLegalBasisResponseDto? Step5Output { get; set; }

        [JsonPropertyName("step6Output")]
        public LawSuitRequestsResponseDto? Step6Output { get; set; }

        [JsonPropertyName("step7Output")]
        public string? Step7Output { get; set; }
    }

    /// <summary>
    /// Request body for the POST (start/initialize) endpoint.
    /// </summary>
    public class StartStatementOfClaimsRequest
    {
        public Guid CaseId { get; set; }
    }
}
