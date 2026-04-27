import type { CaseTypeInfo, FeeBracket } from'./courtFeesTypes';
import { CaseType } from'./courtFeesTypes';

export const CASE_TYPES: CaseTypeInfo[] = [
 { type: CaseType.MONETARY_CLAIM, arabicLabel:'مطالبة مالية', isExempt: false, exemptionReason: null, feeCategory:'progressive', fixedFilingFee: null },
 { type: CaseType.REAL_ESTATE_DISPUTE, arabicLabel:'منازعة عقارية', isExempt: false, exemptionReason: null, feeCategory:'progressive', fixedFilingFee: null },
 { type: CaseType.PERSONAL_STATUS, arabicLabel:'أحوال شخصية', isExempt: false, exemptionReason: null, feeCategory:'fixed', fixedFilingFee: 50 },
 { type: CaseType.LABOR, arabicLabel:'دعوى عمالية', isExempt: true, exemptionReason:'معفاة من الرسوم بموجب قانون العمل المصري', feeCategory:'exempt', fixedFilingFee: null },
 { type: CaseType.COMMERCIAL, arabicLabel:'دعوى تجارية', isExempt: false, exemptionReason: null, feeCategory:'progressive', fixedFilingFee: null },
 { type: CaseType.ADMINISTRATIVE, arabicLabel:'دعوى إدارية', isExempt: false, exemptionReason: null, feeCategory:'fixed', fixedFilingFee: 100 },
 { type: CaseType.CRIMINAL_PRIVATE, arabicLabel:'دعوى جنائية (حق خاص)', isExempt: false, exemptionReason: null, feeCategory:'fixed', fixedFilingFee: 50 },
 { type: CaseType.EXECUTION, arabicLabel:'تنفيذ حكم', isExempt: false, exemptionReason: null, feeCategory:'progressive', fixedFilingFee: null },
 { type: CaseType.INJUNCTION, arabicLabel:'دعوى مستعجلة', isExempt: false, exemptionReason: null, feeCategory:'fixed', fixedFilingFee: 75 },
];

export const FILING_FEE_BRACKETS: FeeBracket[] = [
 { min: 0, max: 5000, rate: 0, fixedFee: 40 },
 { min: 5001, max: 10000, rate: 0.01, fixedFee: 40 },
 { min: 10001, max: 50000, rate: 0.008, fixedFee: 90 },
 { min: 50001, max: 200000, rate: 0.006, fixedFee: 410 },
 { min: 200001, max: 500000, rate: 0.004, fixedFee: 810 },
 { min: 500001, max: 1000000, rate: 0.003, fixedFee: 2010 },
 { min: 1000001, max: 5000000, rate: 0.002, fixedFee: 3510 },
 { min: 5000001, max: null, rate: 0.001, fixedFee: 11510 },
];

export const EXPERT_FEE_RATE = 0.01;
export const EXPERT_FEE_MIN = 100;
export const EXPERT_FEE_MAX = 5000;

export const EXECUTION_FEE_RATE = 0.01;
export const EXECUTION_FEE_MIN = 50;

export const APPEAL_FEE_MULTIPLIER = 1.5;
export const CASSATION_FEE_MULTIPLIER = 2.0;

export function getCaseTypeInfo(type: CaseType): CaseTypeInfo | undefined {
 return CASE_TYPES.find(c => c.type === type);
}

export function getCaseTypeLabel(type: CaseType): string {
 return getCaseTypeInfo(type)?.arabicLabel ?? type;
}
