export type FeeSectionId =
 | 'lawsuit'
 | 'execution'
 | 'treasury'
 | 'maintenance'
 | 'deposit'
 | 'process-server';

export type FeeToolId =
 | 'civil-known'
 | 'civil-unknown'
 | 'family-known'
 | 'execution-basic'
 | 'execution-interest'
 | 'treasury-supply'
 | 'maintenance-arrears'
 | 'deposit'
 | 'simple-warning'
 | 'judgment-announcement'
 | 'certificate'
 | 'official-copy';

export type CivilUnknownKind =
 | 'fixed-partial'
 | 'urgent-partial'
 | 'fixed-total'
 | 'appeal-urgent-partial'
 | 'appeal-fixed-partial'
 | 'bankruptcy'
 | 'high-appeal';

export type ExecutionScope = 'total' | 'partial' | 'sharia';
export type ExecutionRound = 'first' | 'repeat';
export type InterestNature = 'civil' | 'sharia';
export type TreasurySupplyKind = 'family-same' | 'partial' | 'relative-services' | 'accounting-money';
export type MaintenanceMode = 'first' | 'repeat';
export type DepositMode = 'requester' | 'deducted';
export type JudgmentAnnouncementKind = 'partial' | 'civil-appeal' | 'cassation-state';

export interface CourtFeesFormValues {
 lawsuitAmount: number;
 civilUnknownKind: CivilUnknownKind;
 executionAmount: number;
 executionScope: ExecutionScope;
 executionRound: ExecutionRound;
 includeExecutionFixed: boolean;
 includeExecutionPowerOfAttorney: boolean;
 includeExecutionMartyrStamp: boolean;
 interestAmount: number;
 interestYears: number;
 interestNature: InterestNature;
 treasuryCollectedAmount: number;
 treasuryPrincipalAmount: number;
 treasuryExecutionCount: number;
 treasuryKind: TreasurySupplyKind;
 maintenanceMonthlyAmount: number;
 maintenanceFrom: string;
 maintenanceTo: string;
 maintenanceMode: MaintenanceMode;
 depositAmount: number;
 depositMode: DepositMode;
 warningDefendants: number;
 warningRolls: number;
 warningLinkedDefendants: boolean;
 judgmentRolls: number;
 judgmentRecipients: number;
 judgmentKind: JudgmentAnnouncementKind;
 certificateCount: number;
 certificateYears: number;
 certificatePersons: number;
 certificateStakeholder: boolean;
 includeCertifiedPaper: boolean;
 officialCopyPapers: number;
 officialCopyCount: number;
 officialCopyStakeholder: boolean;
 includeOfficialCertifiedPaper: boolean;
}

export interface CourtFeesInput {
 toolId: FeeToolId;
 values: CourtFeesFormValues;
}

export interface FeeDetail {
 label: string;
 amount: number;
 tone?: 'default' | 'strong' | 'success' | 'muted';
 note?: string;
}

export interface FeeSummaryItem {
 label: string;
 value: string;
 tone?: 'default' | 'success' | 'warning';
}

export interface CourtFeesResult {
 title: string;
 fees: FeeDetail[];
 totalFees: number;
 totalPaid: number | null;
 summaries: FeeSummaryItem[];
 notes: string[];
 jurisdiction?: string;
}

export interface FeeToolInfo {
 id: FeeToolId;
 title: string;
 subtitle?: string;
}

export interface FeeSectionInfo {
 id: FeeSectionId;
 title: string;
 tools: FeeToolInfo[];
}
