export const CaseType = {
 MONETARY_CLAIM:'MONETARY_CLAIM',
 REAL_ESTATE_DISPUTE:'REAL_ESTATE_DISPUTE',
 PERSONAL_STATUS:'PERSONAL_STATUS',
 LABOR:'LABOR',
 COMMERCIAL:'COMMERCIAL',
 ADMINISTRATIVE:'ADMINISTRATIVE',
 CRIMINAL_PRIVATE:'CRIMINAL_PRIVATE',
 EXECUTION:'EXECUTION',
 INJUNCTION:'INJUNCTION',
} as const;

export type CaseType = (typeof CaseType)[keyof typeof CaseType];

export interface CourtFeesInput {
 caseType: CaseType |'';
 claimValue: number;
 isAppeal: boolean;
 isCassation: boolean;
}

export interface FeeDetail {
 feeType: string;
 amount: number;
 legalBasis: string;
}

export interface CourtFeesResult {
 fees: FeeDetail[];
 totalFees: number;
 isExempt: boolean;
 exemptionReason: string | null;
 warnings: string[];
}

export interface FeeBracket {
 min: number;
 max: number | null;
 rate: number;
 fixedFee: number;
}

export interface CaseTypeInfo {
 type: CaseType;
 arabicLabel: string;
 isExempt: boolean;
 exemptionReason: string | null;
 feeCategory:'progressive' |'fixed' |'exempt';
 fixedFilingFee: number | null;
}
