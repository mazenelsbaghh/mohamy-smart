import type {
 CivilUnknownKind,
 FeeSectionInfo,
 JudgmentAnnouncementKind,
 TreasurySupplyKind,
} from './courtFeesTypes';

export const COURT_FEE_SECTIONS: FeeSectionInfo[] = [
 {
 id: 'lawsuit',
 title: 'رسم الدعوى والقوائم',
 tools: [
 { id: 'civil-known', title: 'دعوى مدني معلومة القيمة' },
 { id: 'civil-unknown', title: 'دعوى مدني مجهولة / معلومة القيمة' },
 { id: 'family-known', title: 'دعوى شرعي معلومة القيمة' },
 ],
 },
 {
 id: 'execution',
 title: 'رسم التنفيذ',
 tools: [
 { id: 'execution-basic', title: 'رسم تنفيذ' },
 { id: 'execution-interest', title: 'رسم تنفيذ بالفائدة القانونية' },
 ],
 },
 {
 id: 'treasury',
 title: 'توريد المبالغ المحصلة للخزينة',
 tools: [{ id: 'treasury-supply', title: 'توريد المبالغ المحصلة للخزينة' }],
 },
 {
 id: 'maintenance',
 title: 'حساب رسم متجمد نفقة',
 tools: [{ id: 'maintenance-arrears', title: 'حساب رسم متجمد نفقة' }],
 },
 {
 id: 'deposit',
 title: 'رسم الإيداع',
 tools: [{ id: 'deposit', title: 'رسم الإيداع' }],
 },
 {
 id: 'process-server',
 title: 'رسوم قلم المحضرين',
 tools: [
 { id: 'simple-warning', title: 'إنذار بسيط' },
 { id: 'judgment-announcement', title: 'رسم إعلان صورة حكم' },
 { id: 'certificate', title: 'رسم شهادة' },
 { id: 'official-copy', title: 'رسم صورة رسمية' },
 ],
 },
];

export const CIVIL_UNKNOWN_OPTIONS: Array<{ id: CivilUnknownKind; label: string }> = [
 { id: 'fixed-partial', label: 'ثابت جزئي' },
 { id: 'urgent-partial', label: 'جزئي مستعجل' },
 { id: 'fixed-total', label: 'ثابت كلي' },
 { id: 'appeal-urgent-partial', label: 'استئناف جزئي مستعجل' },
 { id: 'appeal-fixed-partial', label: 'ثابت مستأنف جزئي' },
 { id: 'bankruptcy', label: 'إفلاس' },
 { id: 'high-appeal', label: 'استئناف عالي' },
];

export const CIVIL_UNKNOWN_FEE_PRESETS: Record<
 CivilUnknownKind,
 {
 label: string;
 relativeFee: number;
 servicesFee: number;
 courtBuildingFee: number;
 attorneyFee: number;
 martyrStamp: number;
 professionTax: number;
 vat: number;
 }
> = {
 'fixed-partial': {
 label: 'ثابت جزئي',
 relativeFee: 5,
 servicesFee: 2.5,
 courtBuildingFee: 1.5,
 attorneyFee: 50,
 martyrStamp: 0,
 professionTax: 15,
 vat: 20,
 },
 'urgent-partial': {
 label: 'جزئي مستعجل',
 relativeFee: 10,
 servicesFee: 5,
 courtBuildingFee: 1.5,
 attorneyFee: 50,
 martyrStamp: 5,
 professionTax: 15,
 vat: 20,
 },
 'fixed-total': {
 label: 'ثابت كلي',
 relativeFee: 15,
 servicesFee: 7.5,
 courtBuildingFee: 1.5,
 attorneyFee: 75,
 martyrStamp: 5,
 professionTax: 15,
 vat: 40,
 },
 'appeal-urgent-partial': {
 label: 'استئناف جزئي مستعجل',
 relativeFee: 15,
 servicesFee: 7.5,
 courtBuildingFee: 1.5,
 attorneyFee: 75,
 martyrStamp: 5,
 professionTax: 25,
 vat: 40,
 },
 'appeal-fixed-partial': {
 label: 'ثابت مستأنف جزئي',
 relativeFee: 10,
 servicesFee: 5,
 courtBuildingFee: 1.5,
 attorneyFee: 75,
 martyrStamp: 5,
 professionTax: 25,
 vat: 40,
 },
 bankruptcy: {
 label: 'إفلاس',
 relativeFee: 50,
 servicesFee: 25,
 courtBuildingFee: 1.5,
 attorneyFee: 75,
 martyrStamp: 5,
 professionTax: 15,
 vat: 40,
 },
 'high-appeal': {
 label: 'استئناف عالي',
 relativeFee: 30,
 servicesFee: 15,
 courtBuildingFee: 3,
 attorneyFee: 100,
 martyrStamp: 5,
 professionTax: 25,
 vat: 60,
 },
};

export const TREASURY_SUPPLY_OPTIONS: Array<{ id: TreasurySupplyKind; label: string }> = [
 { id: 'family-same', label: 'كلي وأسرة نفس' },
 { id: 'partial', label: 'جزئي' },
 { id: 'relative-services', label: 'نسبي وخدمات' },
 { id: 'accounting-money', label: 'حسابي مال' },
];

export const TREASURY_SUPPLY_PRESETS: Record<TreasurySupplyKind, { fixedFee: number; powerOfAttorneyFee: number }> = {
 'family-same': { fixedFee: 2.5, powerOfAttorneyFee: 2.9 },
 partial: { fixedFee: 1, powerOfAttorneyFee: 2.9 },
 'relative-services': { fixedFee: 0, powerOfAttorneyFee: 2.9 },
 'accounting-money': { fixedFee: 2.5, powerOfAttorneyFee: 0 },
};

export const JUDGMENT_ANNOUNCEMENT_OPTIONS: Array<{ id: JudgmentAnnouncementKind; label: string }> = [
 { id: 'partial', label: 'حكم جزئي' },
 { id: 'civil-appeal', label: 'حكم كلي أو مدني مستأنف' },
 { id: 'cassation-state', label: 'حكم استئناف أو نقض أو مجلس الدولة' },
];

export const JUDGMENT_ANNOUNCEMENT_RATES: Record<JudgmentAnnouncementKind, number> = {
 partial: 0.375,
 'civil-appeal': 1.125,
 'cassation-state': 2.25,
};

export const POWER_OF_ATTORNEY_FEE = 2.9;
export const MARTYR_STAMP = 5;
