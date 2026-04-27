namespace Lawyer.Core.Enum
{
    public enum AiStepType
    {
        FactAnalysis = 1,
        GenerateDefenses = 2,
        AnalysisDefense = 3,
        FinalRequirements = 4,
        DefenseMemoDraft = 5,

        LawsuitCaseType = 10,
        LawsuitParties = 11,
        LawsuitSubjects = 12,
        LawsuitFacts = 13,
        LawsuitLegalBasis = 14,
        LawsuitRequests = 15,

        Ocr = 20,
        ClarifyFacts = 21,

        Chat = 30,

        AppealBriefJudgmentData = 40,
        AppealBriefReasoningAnalysis = 41,
        AppealBriefGrounds = 42,
        AppealBriefRequests = 43,
        AppealBriefLegalBasis = 44,
        AppealBriefAssembly = 45,

        AdminComplaintClassification = 50,
        AdminComplaintFacts = 51,
        AdminComplaintViolation = 52,
        AdminComplaintRequests = 53,
        AdminComplaintAssembly = 54,

        RulingAnalysisOperative = 60,
        RulingAnalysisReasoning = 61,
        RulingAnalysisDefectEvaluation = 62,
        RulingAnalysisFeasibilityReport = 63,

        LegalWarningClassification = 70,
        LegalWarningBodyDraft = 71,
        LegalWarningAssembly = 72,

        ExecRequestClassification = 80,
        ExecRequestDrafting = 81,
        ExecRequestAssembly = 82,

        LegalContractDraft = 90,
        LegalContractAnalysis = 91,
        LegalContractReview = 92,
    }
}
