import type { CourtFeesInput, CourtFeesResult, FeeDetail } from'./courtFeesTypes';
import {
 APPEAL_FEE_MULTIPLIER,
 CASSATION_FEE_MULTIPLIER,
 EXECUTION_FEE_MIN,
 EXECUTION_FEE_RATE,
 EXPERT_FEE_MAX,
 EXPERT_FEE_MIN,
 EXPERT_FEE_RATE,
 FILING_FEE_BRACKETS,
 getCaseTypeInfo,
} from'./courtFeesData';

function calculateBracketFees(value: number): number {
 if (value <= 0) return 0;

 let totalFee = 0;
 let remaining = value;

 for (const bracket of FILING_FEE_BRACKETS) {
 if (remaining <= 0) break;

 const bracketMax = bracket.max ?? Infinity;
 const bracketSize = Math.min(remaining, bracketMax - bracket.min + 1);

 if (bracketSize > 0) {
 if (bracket.rate === 0) {
 totalFee = bracket.fixedFee;
 break;
 } else {
 totalFee += bracketSize * bracket.rate;
 }
 }
 remaining -= bracketSize;
 }

 return Math.round(totalFee * 100) / 100;
}

function calculateFilingFee(value: number): FeeDetail {
 const fee = calculateBracketFees(value);
 return {
 feeType:'رسوم الإيداع',
 amount: fee,
 legalBasis:'قانون الرسوم القضائية رقم 90 لسنة 1944 وتعديلاته',
 };
}

function calculateExpertFee(value: number): FeeDetail {
 const fee = Math.min(EXPERT_FEE_MAX, Math.max(EXPERT_FEE_MIN, value * EXPERT_FEE_RATE));
 return {
 feeType:'رسوم الخبراء',
 amount: Math.round(fee * 100) / 100,
 legalBasis:'قانون الإثبات رقم 25 لسنة 1968',
 };
}

function calculateExecutionFee(value: number): FeeDetail {
 const fee = Math.max(EXECUTION_FEE_MIN, value * EXECUTION_FEE_RATE);
 return {
 feeType:'رسوم التنفيذ',
 amount: Math.round(fee * 100) / 100,
 legalBasis:'قانون المرافعات المدنية والتجارية',
 };
}

export function calculateCourtFees(input: CourtFeesInput): CourtFeesResult {
 const warnings: string[] = [];

 if (!input.caseType) {
 return {
 fees: [],
 totalFees: 0,
 isExempt: false,
 exemptionReason: null,
 warnings: ['يرجى اختيار نوع الدعوى'],
 };
 }

 const caseInfo = getCaseTypeInfo(input.caseType);

 if (!caseInfo) {
 return {
 fees: [],
 totalFees: 0,
 isExempt: false,
 exemptionReason: null,
 warnings: ['نوع الدعوى غير معروف'],
 };
 }

 if (caseInfo.isExempt) {
 return {
 fees: [],
 totalFees: 0,
 isExempt: true,
 exemptionReason: caseInfo.exemptionReason,
 warnings: [],
 };
 }

 const fees: FeeDetail[] = [];

 if (caseInfo.feeCategory ==='fixed' && caseInfo.fixedFilingFee !== null) {
 fees.push({
 feeType:'رسوم الإيداع',
 amount: caseInfo.fixedFilingFee,
 legalBasis:'قانون الرسوم القضائية رقم 90 لسنة 1944 وتعديلاته',
 });
 } else if (caseInfo.feeCategory ==='progressive') {
 if (input.claimValue <= 0) {
 return {
 fees: [],
 totalFees: 0,
 isExempt: false,
 exemptionReason: null,
 warnings: ['يرجى إدخال قيمة الدعوى'],
 };
 }

 fees.push(calculateFilingFee(input.claimValue));

 if (input.caseType !=='EXECUTION') {
 fees.push(calculateExpertFee(input.claimValue));
 } else {
 fees.push(calculateExecutionFee(input.claimValue));
 }
 }

 if (input.isCassation) {
 const baseFees = fees.reduce((sum, f) => sum + f.amount, 0);
 fees.push({
 feeType:'رسوم النقض',
 amount: Math.round((baseFees * (CASSATION_FEE_MULTIPLIER - 1)) * 100) / 100,
 legalBasis:'قانون السلطة القضائية — رسم نقض إضافي',
 });
 } else if (input.isAppeal) {
 const baseFees = fees.reduce((sum, f) => sum + f.amount, 0);
 fees.push({
 feeType:'رسوم الاستئناف',
 amount: Math.round((baseFees * (APPEAL_FEE_MULTIPLIER - 1)) * 100) / 100,
 legalBasis:'قانون الرسوم القضائية — رسم استئناف إضافي',
 });
 }

 warnings.push('هذه الحسابات تقريبية وقد تختلف عن الرسوم الفعلية. يرجى مراجعة المحكمة المختصة.');

 const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);

 return {
 fees,
 totalFees: Math.round(totalFees * 100) / 100,
 isExempt: false,
 exemptionReason: null,
 warnings,
 };
}
