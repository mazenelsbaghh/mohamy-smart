using System.Collections.Generic;
using System.Text.Json.Serialization;
using Lawyer.Application.Dtos.SmartAnalysis;

namespace Lawyer.Application.Services.Workflows
{
    // These DTOs map exactly to the known frontend states and AI prompt structures requested.

    public record RulingStep1Output
    {
        [JsonPropertyName("verdictSummary")]
        public string? VerdictSummary { get; init; }
        
        [JsonPropertyName("charges")]
        public List<string>? Charges { get; init; }
        
        [JsonPropertyName("verdictPoints")]
        public List<string>? VerdictPoints { get; init; }
        
        [JsonExtensionData]
        public Dictionary<string, object>? ExtensionData { get; set; }
    }

    public record RulingStep2Output
    {
        [JsonPropertyName("reasoningPoints")]
        public List<string>? ReasoningPoints { get; init; }
        
        [JsonPropertyName("keyFindings")]
        public List<string>? KeyFindings { get; init; }

        [JsonExtensionData]
        public Dictionary<string, object>? ExtensionData { get; set; }
    }

    public record RulingStep3Output
    {
        [JsonPropertyName("defects")]
        public List<DefectDto>? Defects { get; init; }

        [JsonExtensionData]
        public Dictionary<string, object>? ExtensionData { get; set; }
    }
    
    public record DefectDto 
    {
        [JsonPropertyName("description")]
        public string? Description { get; init; }
        
        [JsonPropertyName("severity")]
        public string? Severity { get; init; }
    }

    public record RulingStep4Output
    {
        [JsonPropertyName("isAppealViable")]
        public bool? IsAppealViable { get; init; }
        
        [JsonPropertyName("appealStrength")]
        public string? AppealStrength { get; init; }
        
        [JsonPropertyName("recommendedGrounds")]
        public List<string>? RecommendedGrounds { get; init; }
        
        [JsonPropertyName("conclusion")]
        public string? Conclusion { get; init; }

        [JsonExtensionData]
        public Dictionary<string, object>? ExtensionData { get; set; }
    }


    // Smart Analysis Steps
    public record FactAnalysisStepOutput
    {
        public List<string>? LegalFactsSummary { get; init; }

        [JsonPropertyName("opposing_parties_positions")]
        public List<DefendantPositionDto>? DefendantsPositions { get; init; }

        public List<EvidenceMapItemDto>? EvidenceMap { get; init; }

        public List<string>? LegalAndTechnicalReviewPoints { get; init; }

        public PotentialLegalCharacterizationDto? PotentialLegalCharacterization { get; init; }
    }

    public record GenerateDefensesStepOutput
    {
        public List<DefenseDetailDto>? DefensesFormal { get; init; }

        public List<DefenseDetailDto>? DefensesSubstantive { get; init; }

        public List<DefenseDetailDto>? DefensesEvidentiary { get; init; }
    }

    public record AnalysisDefenseStepOutput
    {
        public string? DefenseTitle { get; init; }

        public CaseReferenceDto? CaseReference { get; init; }

        public DefenseMemorandumDto? Memorandum { get; init; }
    }

    public record FinalRequirementsStepOutput
    {
        public List<FinalPrayerItemDto>? FinalPrayers { get; init; }
    }

    // Statement of Claims Steps
    public record LawsuitCaseTypeStepOutput
    {
        public string? CaseMainType { get; init; }

        public string? CaseSubType { get; init; }

        public string? CourtType { get; init; }

        public string? ProceduralNature { get; init; }

        public string? IsUrgentOrSummary { get; init; }

        public string? JustificationSummary { get; init; }
    }

    public record LawsuitPartiesStepOutput // (lawsuit-step2-parties.txt)
    {
        public List<LawsuitPartyDto>? Parties { get; init; }
    }

    public record LawsuitPartyDto
    {
        public string? Name { get; init; }

        public string? Role { get; init; }

        public string? Type { get; init; }

        public string? LegalCapacity { get; init; }

        public string? Address { get; init; }

        public string? NationalId { get; init; }
    }

    public record LawsuitFactsStepOutput // lawsuit-step3-facts
    {
        public string? FactsNarrative { get; init; }
    }

    public record LawsuitSubjectsStepOutput // lawsuit-step4-subject
    {
        public string? SubjectTitle { get; init; }

        public string? SubjectFullText { get; init; }
    }

    public record LawsuitLegalBasisStepOutput // lawsuit-step5-legal-basis
    {
        public List<LawsuitLegalTextDto>? LegalTexts { get; init; }

        public List<LawsuitCassationRulingDto>? CassationRulings { get; init; }
    }

    public record LawsuitLegalTextDto
    {
        public string? LawName { get; init; }
        public string? ArticleNumber { get; init; }
        public string? ArticleText { get; init; }
        public string? ApplicationNotes { get; init; }
    }

    public record LawsuitCassationRulingDto
    {
        public string? Court { get; init; }
        public string? AppealNumber { get; init; }
        public string? JudicialYear { get; init; }
        public string? SessionDate { get; init; }
        public string? RulingText { get; init; }
        public string? ApplicationNotes { get; init; }
    }

    public record LawsuitRequestsStepOutput // lawsuit-step6-requests
    {
        public List<LawsuitRequestItemDto>? PrincipalRequests { get; init; }

        public List<LawsuitRequestItemDto>? SubsidiaryRequests { get; init; }

        public List<LawsuitRequestItemDto>? ProceduralRequests { get; init; }
    }

    public record LawsuitRequestItemDto
    {
        public int? RequestNumber { get; init; }

        public string? RequestText { get; init; }

        public string? LegalReference { get; init; }
    }

    // Add generic dynamic dictionary fallback for unknown outputs
    public class DynamicStepOutput : Dictionary<string, object>
    {
    }

    public record AppealBriefStepOutput
    {
        public string? FullAppealText { get; init; }
        
        [JsonExtensionData]
        public Dictionary<string, object>? ExtensionData { get; set; }
    }
    
    public record AdminComplaintStepOutput
    {
        public string? ComplaintType { get; init; }
        
        public string? TargetAuthority { get; init; }
        
        public string? LegalBasis { get; init; }
        
        [JsonExtensionData]
        public Dictionary<string, object>? ExtensionData { get; set; }
    }
    
    public record LegalWarningStepOutput
    {
        public string? WarningType { get; init; }
        
        public string? ObligationDetails { get; init; }
        
        public string? RecommendedAction { get; init; }

        [JsonExtensionData]
        public Dictionary<string, object>? ExtensionData { get; set; }
    }
    
    public record ExecRequestStepOutput
    {
        public string? RequestType { get; init; }
        
        public string? LegalBasis { get; init; }
        
        public string? ExecutionGrounds { get; init; }
        
        public string? UrgencyLevel { get; init; }

        [JsonExtensionData]
        public Dictionary<string, object>? ExtensionData { get; set; }
    }
}
