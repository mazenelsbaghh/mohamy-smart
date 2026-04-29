using System;
using System.Text.Json.Serialization;

namespace Lawyer.Application.Dtos.PreparingStatementOfClaims
{
    public class StatementOfClaimsSummaryDto
    {
        public Guid CaseId { get; set; }

        public string? RunId { get; set; }

        public string WorkflowType { get; set; } = "preparing-statement-of-claims";

        public int CurrentStep { get; set; }

        public int CurrentAccessibleStep { get; set; }

        public int LastCompletedStep { get; set; }

        public string Status { get; set; } = "NotStarted";

        public bool IsReadOnly { get; set; }

        public object[] ActiveRequests { get; set; } = Array.Empty<object>();

        public object[] StageConflicts { get; set; } = Array.Empty<object>();

        public DateTime? CreatedAt { get; set; }

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

        [JsonPropertyName("canStart")]
        public bool CanStart { get; set; }

        [JsonPropertyName("canResumeCurrent")]
        public bool CanResumeCurrent { get; set; }

        [JsonPropertyName("canStartNew")]
        public bool CanStartNew { get; set; }

        [JsonPropertyName("currentRunCreatedAt")]
        public DateTime? CurrentRunCreatedAt { get; set; }
    }

    /// <summary>
    /// Request body for the POST (start/initialize) endpoint.
    /// </summary>
    public class StartStatementOfClaimsRequest
    {
        public Guid CaseId { get; set; }
    }
}
