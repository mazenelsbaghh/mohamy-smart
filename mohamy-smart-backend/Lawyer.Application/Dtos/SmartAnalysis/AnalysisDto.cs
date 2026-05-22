using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Lawyer.Application.Dtos.SmartAnalysis
{
    public class CaseAnalysisRequestDto
    {
        public Guid CaseId { get; set; }
        public string CaseFacts { get; set; } = string.Empty;
        public string? RunId { get; set; }
    }

    public class CaseAnalysisResultDto
    {
        [JsonPropertyName("case_type")]
        public string CaseType { get; set; } = string.Empty;

        [JsonPropertyName("case_number")]
        public string CaseNumber { get; set; } = string.Empty;

        [JsonPropertyName("court_name")]
        public string CourtName { get; set; } = string.Empty;

        [JsonPropertyName("legal_facts_summary")]
        public List<string> LegalFactsSummary { get; set; } = new();

        [JsonPropertyName("opposing_parties_positions")]
        public List<DefendantPositionDto> DefendantsPositions { get; set; } = new();

        [JsonPropertyName("evidence_map")]
        public List<EvidenceMapItemDto> EvidenceMap { get; set; } = new();

        [JsonPropertyName("legal_and_technical_review_points")]
        public List<string> LegalAndTechnicalReviewPoints { get; set; } = new();

        [JsonPropertyName("potential_legal_characterization")]
        public PotentialLegalCharacterizationDto PotentialLegalCharacterization { get; set; } = new();
    }

    public class DefendantPositionDto
    {
        [JsonPropertyName("party_name")]
        public string DefendantName { get; set; } = string.Empty;

        [JsonPropertyName("relationship_to_client")]
        public string RelationshipToClient { get; set; } = string.Empty;

        [JsonPropertyName("position_summary")]
        public string PositionSummary { get; set; } = string.Empty;
    }

    public class EvidenceMapItemDto
    {
        public string Source { get; set; } = string.Empty;
        public string Proves { get; set; } = string.Empty;

        public string DoesNotProve { get; set; } = string.Empty;

        public string Limitations { get; set; } = string.Empty;
    }

    public class PotentialLegalCharacterizationDto
    {
        [JsonPropertyName("charge_description")]
        public string ChargeDescription { get; set; } = string.Empty;

        [JsonPropertyName("elements_relied_upon")]
        public List<string> ElementsReliedUpon { get; set; } = new();

        [JsonPropertyName("elements_lacking_proof")]
        public List<string> ElementsLackingProof { get; set; } = new();
    }

    public class CaseDefensesResultDto
    {
        public List<DefenseDetailDto> DefensesFormal { get; set; } = new();

        public List<DefenseDetailDto> DefensesSubstantive { get; set; } = new();

        public List<DefenseDetailDto> DefensesEvidentiary { get; set; } = new();
    }

    public class DefenseDetailDto
    {
        public Guid? Id { get; set; }

        public string DefenseTitle { get; set; } = string.Empty;

        public string BasisFromCase { get; set; } = string.Empty;

        public string Scope { get; set; } = string.Empty;
        public string Strength { get; set; } = string.Empty;
    }

    public class CaseDefensesRequestDto
    {
        public Guid CaseId { get; set; }
        public string CaseFacts { get; set; } = string.Empty;
        public CaseAnalysisResultDto LegalAnalysis { get; set; } = new();
        public string? RunId { get; set; }
    }


    public class AnalyzeDefenseRequestDto
    {
        public Guid DefenseId { get; set; }
        public Guid CaseId { get; set; }
        public string ClientDefenseId { get; set; } = string.Empty;
        public string DefenseTitle { get; set; } = string.Empty;
        public string BasisFromCase { get; set; } = string.Empty;
        public string Scope { get; set; } = string.Empty;
        public string? RunId { get; set; }
    }

    public class CreateDefenseRequestDto
    {
        public Guid CaseId { get; set; }
        public string DefenseTitle { get; set; } = string.Empty;
        public string BasisFromCase { get; set; } = string.Empty;
        public string Scope { get; set; } = string.Empty;
        public string? Type { get; set; }
    }

    public class UpdateDefenseTitleRequestDto
    {
        public string DefenseTitle { get; set; } = string.Empty;
    }

    public class AnalyzeDefenseResponseDto
    {
        public Guid DefenseId { get; set; }
        public string ClientDefenseId { get; set; } = string.Empty;

        public string DefenseTitle { get; set; } = string.Empty;

        public CaseReferenceDto CaseReference { get; set; } = new();

        public DefenseMemorandumDto Memorandum { get; set; } = new();
    }

    public class CaseReferenceDto
    {
        public string CaseType { get; set; } = string.Empty;

        public string CaseNumber { get; set; } = string.Empty;

        public string CourtName { get; set; } = string.Empty;
    }

    public class DefenseMemorandumDto
    {
        public string Introduction { get; set; } = string.Empty;

        public string FactualBasis { get; set; } = string.Empty;

        public List<LegalTextDto> LegalTextsFull { get; set; } = new();

        public string LegalTextsUnavailableReason { get; set; } = string.Empty;

        public string LinkingTextsToFacts { get; set; } = string.Empty;

        public List<CassationPrecedentDto> CassationPrecedentsFull { get; set; } = new();

        public string CassationPrecedentsUnavailableReason { get; set; } = string.Empty;

        public string LegalApplication { get; set; } = string.Empty;

        public string CounterArgumentsAndResponse { get; set; } = string.Empty;

        public string LegalEffectOfAcceptance { get; set; } = string.Empty;

        public string StrengthsAndRisks { get; set; } = string.Empty;
    }

    public class LegalTextDto
    {
        public string LawName { get; set; } = string.Empty;

        public string ArticleNumber { get; set; } = string.Empty;

        public string FullText { get; set; } = string.Empty;
    }

    public class CassationPrecedentDto
    {
        public string AppealNumber { get; set; } = string.Empty;

        public string JudicialYear { get; set; } = string.Empty;

        public string SessionDate { get; set; } = string.Empty;

        public string FullText { get; set; } = string.Empty;
    }

    public class FinalRequirementsRequestDto
    {
        public Guid CaseId { get; set; }
        public string? RunId { get; set; }
    }

    public class FinalPrayerItemDto
    {
        public Guid? Id { get; set; }

        public string RequestLevel { get; set; } = string.Empty;

        public string RequestText { get; set; } = string.Empty;
    }

    public class FinalRequirementsResponseDto
    {
        public List<FinalPrayerItemDto> FinalPrayers { get; set; } = new();
    }

    public class GenerateCasePdfRequestDto
    {
        public Guid CaseId { get; set; }
    }

    public class CaseSmartAnalysisSummaryDto
    {
        public Guid CaseId { get; set; }
        public string CaseNumber { get; set; } = string.Empty;
        public string CaseType { get; set; } = string.Empty;
        public string CourtName { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string ApponentName { get; set; } = string.Empty;
        [JsonPropertyName("step1Output")]
        public CaseAnalysisResultDto? FactAnalysis { get; set; }

        [JsonPropertyName("step2Output")]
        public CaseDefensesResultDto? Defenses { get; set; }

        [JsonPropertyName("step3Output")]
        public List<DefenseAnalysisSummaryItemDto>? DefenseAnalyses { get; set; }

        [JsonPropertyName("step4Output")]
        public FinalRequirementsResponseDto? FinalRequirements { get; set; }

        [JsonPropertyName("step5Output")]
        public string? DefenseMemoDraft { get; set; }

        [JsonPropertyName("isMemoApproved")]
        public bool IsMemoApproved { get; set; }

        [JsonPropertyName("lastSavedAt")]
        public DateTime? LastSavedAt { get; set; }
    }

    public class DefenseAnalysisSummaryItemDto
    {
        public Guid DefenseId { get; set; }
        public string? ExplanationJson { get; set; }
    }

}
