using System;
using System.Collections.Generic;

namespace Lawyer.Application.Dtos.SmartAnalysis
{
    public class DefenseMemoDraftRequestDto
    {
        public Guid CaseId { get; set; }
        public string? RunId { get; set; }
        public string CaseNumber { get; set; } = string.Empty;
        public string CaseType { get; set; } = string.Empty;
        public string CourtName { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string ApponentName { get; set; } = string.Empty;
        public string DefendingParty { get; set; } = string.Empty;

        public List<string> LegalFactsSummary { get; set; } = new();
        public List<DefendantPositionInput> DefendantsPositions { get; set; } = new();

        public List<ApprovedDefenseInput> ApprovedDefenses { get; set; } = new();

        public List<FinalRequestInput> FinalRequests { get; set; } = new();
    }

    public class DefenseMemoFrameSectionsDto
    {
        public string OpeningHtml { get; set; } = string.Empty;
        public string FactsHtml { get; set; } = string.Empty;
        public string RequestsHtml { get; set; } = string.Empty;
        public string ClosingHtml { get; set; } = string.Empty;
    }

    public class DraftedDefenseSectionDto
    {
        public string DefenseTitle { get; set; } = string.Empty;
        public string DefenseType { get; set; } = string.Empty;
        public int SourceOrder { get; set; }
        public string Html { get; set; } = string.Empty;
    }

    public class ApprovedDefenseInput
    {
        public string DefenseTitle { get; set; } = string.Empty;
        public string BasisFromCase { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DefenseExplanationInput Explanation { get; set; } = new();
    }

    public class DefenseExplanationInput
    {
        public string Introduction { get; set; } = string.Empty;
        public string FactualBasis { get; set; } = string.Empty;
        public List<LegalTextInput> LegalTexts { get; set; } = new();
        public string LinkingTextsToFacts { get; set; } = string.Empty;
        public List<CassationPrecedentInput> CassationPrecedents { get; set; } = new();
        public string LegalApplication { get; set; } = string.Empty;
        public string CounterArguments { get; set; } = string.Empty;
        public string LegalEffectOfAcceptance { get; set; } = string.Empty;
    }

    public class LegalTextInput
    {
        public string LawName { get; set; } = string.Empty;
        public string ArticleNumber { get; set; } = string.Empty;
        public string FullText { get; set; } = string.Empty;
    }

    public class CassationPrecedentInput
    {
        public string AppealNumber { get; set; } = string.Empty;
        public string JudicialYear { get; set; } = string.Empty;
        public string SessionDate { get; set; } = string.Empty;
        public string FullText { get; set; } = string.Empty;
    }

    public class DefendantPositionInput
    {
        public string DefendantName { get; set; } = string.Empty;
        public string RelationshipToClient { get; set; } = string.Empty;
        public string PositionSummary { get; set; } = string.Empty;
    }

    public class FinalRequestInput
    {
        public string RequestLevel { get; set; } = string.Empty;
        public string RequestText { get; set; } = string.Empty;
    }

    public class DefenseMemoDraftResponseDto
    {
        public string MemoHtml { get; set; } = string.Empty;
    }
}
