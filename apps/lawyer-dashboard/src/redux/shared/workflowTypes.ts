import type { IWorkflowDto } from'./createWorkflowThunks';

export type WorkflowStatus ='NotStarted' |'InProgress' |'Completed' |'Abandoned';

export interface BaseWorkflowState {
 workflowId: number | null;
 caseId: string | null;
 currentStep: number;
 status: WorkflowStatus;
 createdAt: string | null;
 lastSavedAt: string | null;
 workflowVersions: IWorkflowDto[];
 isReadOnly: boolean;
 snapshotId: number | null;
 snapshotLabel: string | null;
 
 loadingState: {
 isStarting: boolean;
 isGetting: boolean;
 isRunningStep: boolean;
 isSavingStep: boolean;
 isAutoSaving: boolean;
 };
 
 errorState: {
 startError: string | null;
 getError: string | null;
 runError: string | null;
 saveError: string | null;
 autoSaveError: string | null;
 hasConcurrencyConflict: boolean;
 };
}

export type TypedWorkflowState<TStepOutputs> = BaseWorkflowState & {
 outputs: TStepOutputs;
};

// ─── Defense Memo Step Output Types (from smartAnalysisSlice) ───

export type TDefense = {
 id: string;
 defenseTitle: string;
 basisFromCase: string;
 scope: string;
 strength:"Strong" |"Medium" |"Weak";
 isLocal?: boolean;
};

export type TDefenses = {
 defensesFormal: TDefense[];
 defensesSubstantive: TDefense[];
 defensesEvidentiary: TDefense[];
} | null;

export type TFactAnalysis = {
 caseType: string;
 caseNumber: string;
 courtName: string;
 legalFactsSummary: string[];
 defendantsPositions: {
 defendantName: string;
 relationshipToClient: string;
 positionSummary: string;
 }[];
 evidenceMap: {
 source: string;
 proves: string;
 doesNotProve: string;
 limitations: string;
 }[];
 legalAndTechnicalReviewPoints: string[];
 potentialLegalCharacterization: {
 chargeDescription: string;
 elementsReliedUpon: string[];
 elementsLackingProof: string[];
 };
} | null;

export type TFinalRequirements = {
 id: string;
 requestLevel: string;
 requestText: string;
};

export type TFinalRequirementsWrapper = {
 finalPrayers: TFinalRequirements[];
} | null;

export interface TDefenseMemorandum {
 introduction: string;
 factualBasis: string;
 legalTextsFull: {
 lawName: string;
 articleNumber: string;
 fullText: string;
 }[];
 legalTextsUnavailableReason: string;
 linkingTextsToFacts: string;
 cassationPrecedentsFull: {
 appealNumber: string;
 judicialYear: string;
 sessionDate: string;
 fullText: string;
 }[];
 cassationPrecedentsUnavailableReason: string;
 legalApplication: string;
 counterArgumentsAndResponse: string;
 legalEffectOfAcceptance: string;
 strengthsAndRisks: string;
}

export type TAnalysisDefenses = Record<string, TDefenseMemorandum> | null;

// ─── Statement of Claims Step Output Types (from preparingStatementOfClaimsUnifiedSlice) ───

export type TCaseDetails = {
 caseId: string;
 caseMainType: string;
 caseSubType: string;
 courtType: string;
 proceduralNature: string;
 isUrgentOrSummary: string;
 justificationSummary: string;
};

export type TLawsuitParty = {
 id: string;
 name: string;
 role: string;
 type: string;
 legalCapacity: string;
 address: string;
 nationalId: string;
};

export type TLawsuitParties = {
 caseId: string;
 parties: TLawsuitParty[];
};

export type TLawsuitSubjects = {
 caseId: string;
 subjectTitle: string;
 subjectFullText: string;
};

export type TLawsuitLegalBasis = {
 caseId: string;
 legalTexts: {
 id: string;
 lawName: string;
 articleNumber: string;
 articleText: string;
 applicationNotes: string;
 }[];
 cassationRulings: {
 id: string;
 court: string;
 appealNumber: string;
 judicialYear: string;
 sessionDate: string;
 rulingText: string;
 applicationNotes: string;
 }[];
};

export type TLawsuitRequests = {
 caseId: string;
 principalRequests: {
 id: string;
 requestNumber: number;
 requestText: string;
 legalReference: string;
 }[];
 subsidiaryRequests: {
 id: string;
 requestNumber: number;
 requestText: string;
 legalReference: string;
 }[];
 proceduralRequests: {
 id: string;
 requestNumber: number;
 requestText: string;
 legalReference: string;
 }[];
};

export type TStatementOfClaimsOutputs = {
 1?: TCaseDetails | null;
 2?: TLawsuitParties | null;
 3?: TLawsuitSubjects | null;
 4?: { factsNarrative: string } | null;
 5?: TLawsuitLegalBasis | null;
 6?: TLawsuitRequests | null;
 7?: string;
};

// ─── Appeal Brief Step Output Types ───

export type TAppealJudgmentData = {
 judgmentData?: {
 courtName?: string;
 caseNumber?: string;
 pronouncementExact?: string;
 parties?: string;
 };
 courtInformation?: string;
 parties?: string;
 verdict?: string;
 [key: string]: unknown;
} | null;

export type TAppealReasoningAnalysis = {
 analysis?: string;
 legalFlaws?: string[];
 [key: string]: unknown;
} | null;

export type TAppealGrounds = {
 grounds?: string[];
 [key: string]: unknown;
} | null;

export type TAppealRequests = {
 requests?: string[];
 proceduralRequests?: unknown[];
 substantiveRequests?: unknown[];
 urgentRequests?: unknown[];
 [key: string]: unknown;
} | null;

export type TAppealLegalBasis = {
 laws?: string[];
 precedents?: string[];
 legalBasis?: unknown[];
 [key: string]: unknown;
} | null;

export type TAppealFinalAssembly = {
 fullAppealText: string;
 [key: string]: unknown;
} | null;

export type TAppealBriefOutputs = {
 1?: TAppealJudgmentData;
 2?: TAppealReasoningAnalysis;
 3?: TAppealGrounds;
 4?: TAppealRequests;
 5?: TAppealLegalBasis;
 6?: TAppealFinalAssembly;
};

// ─── Admin Complaint Step Output Types ───

export type TComplaintClassification = {
 complaintType: string;
 targetAuthority: string;
 legalBasis: string;
} | null;

export type TComplaintFactsDraft = {
 factsSummary: string;
 keyFacts: string[];
} | null;

export type TComplaintViolationAnalysis = {
 violations: { description: string; legalRef: string }[];
} | null;

export type TComplaintRequestsDraft = {
 requests: string[];
} | null;

export type TComplaintFinalDocument = {
 documentText: string;
} | null;

export type TAdminComplaintOutputs = {
 1?: TComplaintClassification;
 2?: TComplaintFactsDraft;
 3?: TComplaintViolationAnalysis;
 4?: TComplaintRequestsDraft;
 5?: TComplaintFinalDocument;
};

// ─── Ruling Analysis Step Output Types ───

export type TVerdictAnalysis = {
 verdictSummary: string;
 verdictPoints: string[];
 charges: string[];
} | null;

export type TReasonsAnalysis = {
 reasoningPoints: string[];
 keyFindings: string[];
} | null;

export type TDefectsEvaluation = {
 defects: { description: string; severity: string }[];
} | null;

export type TAppealViability = {
 isAppealViable: boolean;
 appealStrength: string | number;
 recommendedGrounds: string[];
 conclusion: string;
} | null;

// ─── Legal Warning Step Output Types ───

export type TWarningClassification = {
 warningType: string;
 legalBasis: { type: string; description: string };
 obligationDetails: string;
 recommendedAction: string;
} | null;

export type TWarningDraft = {
 warningBody: string;
 keyPoints: string[];
} | null;

export type TWarningFinalDocument = {
 documentText: string;
} | null;

export type TLegalWarningOutputs = {
 1?: TWarningClassification;
 2?: TWarningDraft;
 3?: TWarningFinalDocument;
};

// ─── Exec Request Step Output Types ───

export type TExecClassification = {
 requestType: string;
 legalBasis: string;
 executionGrounds: string;
 urgencyLevel?: string;
} | null;

export type TExecDrafting = {
 requestBody: string;
 keyArguments: string[];
} | null;

export type TExecFinalAssembly = {
 documentText: string;
} | null;

export type TExecRequestOutputs = {
 1?: TExecClassification;
 2?: TExecDrafting;
 3?: TExecFinalAssembly;
};
