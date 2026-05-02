import type { CourtFeesInput, CourtFeesResult, FeeDetail } from './courtFeesTypes';
import {
 CIVIL_UNKNOWN_FEE_PRESETS,
 JUDGMENT_ANNOUNCEMENT_RATES,
 MARTYR_STAMP,
 POWER_OF_ATTORNEY_FEE,
 TREASURY_SUPPLY_PRESETS,
} from './courtFeesData';

const roundMoney = (value: number): number => Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
const positive = (value: number): number => Math.max(Number.isFinite(value) ? value : 0, 0);

const total = (fees: FeeDetail[]): number => roundMoney(fees.reduce((sum, fee) => sum + fee.amount, 0));

const result = (
 title: string,
 fees: FeeDetail[],
 options?: Partial<Omit<CourtFeesResult, 'title' | 'fees' | 'totalFees'>>
): CourtFeesResult => {
 const totalFees = total(fees);

 return {
 title,
 fees,
 totalFees,
 totalPaid: options?.totalPaid ?? totalFees,
 summaries: options?.summaries ?? [],
 notes: options?.notes ?? [],
 jurisdiction: options?.jurisdiction,
 };
};

const claimJurisdiction = (amount: number): string =>
 amount > 100000 ? 'ترفع أمام المحكمة الابتدائية' : 'ترفع أمام محكمة المواد الجزئية';

const lawsuitTaxes = (professionTax: number, vat: number): FeeDetail[] => [
 { label: 'ضريبة المهن', amount: professionTax, tone: 'muted' },
 { label: 'ضريبة القيمة المضافة', amount: vat, tone: 'muted' },
];

const calculateCivilKnown = (amountInput: number): CourtFeesResult => {
 const amount = positive(amountInput);
 const relativeFee = roundMoney(amount * 0.0275);
 const servicesFee = roundMoney(relativeFee / 2);
 const courtBuildingFee = 1.5;
 const attorneyFee = 50;
 const martyrStamp = amount > 0 ? MARTYR_STAMP : 0;
 const baseFees: FeeDetail[] = [
 { label: 'نسبي', amount: relativeFee },
 { label: 'خدمات', amount: servicesFee },
 { label: 'صندوق أبنية المحاكم', amount: courtBuildingFee },
 { label: 'أتعاب المحاماة', amount: attorneyFee },
 { label: 'دمغة الشهيد', amount: martyrStamp },
 ];
 const baseTotal = total(baseFees);
 const taxes = lawsuitTaxes(15, 20);
 const taxTotal = 35;

 return result('دعوى مدني معلومة القيمة', [...baseFees, ...taxes], {
 totalPaid: roundMoney(baseTotal + taxTotal),
 jurisdiction: claimJurisdiction(amount),
 summaries: [
 { label: 'الإجمالي', value: baseTotal.toLocaleString('ar-EG'), tone: 'success' },
 { label: 'إجمالي الضريبة', value: taxTotal.toLocaleString('ar-EG'), tone: 'success' },
 { label: 'قيمة قوائم الرسوم - نسبي', value: 'لا توجد رسوم مستحقة' },
 { label: 'قيمة قوائم الرسوم - خدمات', value: 'لا توجد رسوم مستحقة' },
 ],
 });
};

const calculateFamilyKnown = (amountInput: number): CourtFeesResult => {
 const amount = positive(amountInput);
 const relativeFee = roundMoney(amount * 0.01);
 const servicesFee = roundMoney(relativeFee / 2);
 const baseFees: FeeDetail[] = [
 { label: 'نسبي', amount: relativeFee },
 { label: 'خدمات', amount: servicesFee },
 { label: 'صندوق أبنية المحاكم', amount: 1.5 },
 { label: 'أتعاب المحاماة', amount: 75 },
 { label: 'دمغة الشهيد', amount: amount > 0 ? MARTYR_STAMP : 0 },
 ];
 const baseTotal = total(baseFees);
 const taxes = lawsuitTaxes(15, 40);
 const taxTotal = 55;

 return result('دعوى شرعي معلومة القيمة', [...baseFees, ...taxes], {
 totalPaid: roundMoney(baseTotal + taxTotal),
 summaries: [
 { label: 'الإجمالي', value: baseTotal.toLocaleString('ar-EG'), tone: 'success' },
 { label: 'إجمالي الضريبة', value: taxTotal.toLocaleString('ar-EG'), tone: 'success' },
 { label: 'قيمة قوائم الرسوم - نسبي', value: 'لا توجد رسوم مستحقة' },
 { label: 'قيمة قوائم الرسوم - خدمات', value: 'لا توجد رسوم مستحقة' },
 { label: 'قيمة قوائم الرسوم - إجمالي', value: 'لا توجد رسوم مستحقة' },
 ],
 });
};

const calculateCivilUnknown = (input: CourtFeesInput): CourtFeesResult => {
 const preset = CIVIL_UNKNOWN_FEE_PRESETS[input.values.civilUnknownKind];
 const baseFees: FeeDetail[] = [
 { label: 'نسبي', amount: preset.relativeFee },
 { label: 'خدمات', amount: preset.servicesFee },
 { label: 'صندوق أبنية المحاكم', amount: preset.courtBuildingFee },
 { label: 'أتعاب المحاماة', amount: preset.attorneyFee },
 { label: 'دمغة الشهيد', amount: preset.martyrStamp },
 ];
 const baseTotal = total(baseFees);
 const taxes = lawsuitTaxes(preset.professionTax, preset.vat);
 const taxTotal = preset.professionTax + preset.vat;

 return result(preset.label, [...baseFees, ...taxes], {
 totalPaid: roundMoney(baseTotal + taxTotal),
 summaries: [
 { label: 'الإجمالي', value: baseTotal.toLocaleString('ar-EG'), tone: 'success' },
 { label: 'إجمالي الضريبة', value: taxTotal.toLocaleString('ar-EG'), tone: 'success' },
 ],
 });
};

const getExecutionRelativeFee = (amount: number, scope: CourtFeesInput['values']['executionScope'], round: CourtFeesInput['values']['executionRound']): number => {
 if (scope === 'sharia') {
 return roundMoney(amount * (round === 'first' ? 0.003333333 : 0.001111111));
 }

 return roundMoney(amount * (round === 'first' ? 0.009166667 : 0.003055556));
};

const getExecutionFixedFee = (scope: CourtFeesInput['values']['executionScope'], round: CourtFeesInput['values']['executionRound']): number => {
 if (round === 'repeat') return 0.85;
 if (scope === 'partial') return 1;

 return 2.5;
};

const calculateExecution = (input: CourtFeesInput): CourtFeesResult => {
 const amount = positive(input.values.executionAmount);
 const relativeFee = getExecutionRelativeFee(amount, input.values.executionScope, input.values.executionRound);
 const servicesFee = roundMoney(relativeFee / 2);
 const fixedFee = input.values.includeExecutionFixed ? getExecutionFixedFee(input.values.executionScope, input.values.executionRound) : 0;
 const powerOfAttorneyFee = input.values.includeExecutionPowerOfAttorney ? POWER_OF_ATTORNEY_FEE : 0;
 const martyrStamp = input.values.includeExecutionMartyrStamp ? MARTYR_STAMP : 0;
 const fees: FeeDetail[] = [
 { label: 'نسبي', amount: relativeFee },
 { label: 'خدمات', amount: servicesFee },
 { label: 'ثابت', amount: fixedFee },
 { label: 'دمغة توكيل', amount: powerOfAttorneyFee },
 { label: 'دمغة الشهيد', amount: martyrStamp },
 ];
 const totalFees = total(fees);

 return result('رسم تنفيذ', fees, {
 totalPaid: roundMoney(amount + totalFees),
 summaries: [{ label: 'قيمة التصالح', value: roundMoney(amount * (2 / 3)).toLocaleString('ar-EG') }],
 notes: ['دمغة التوكيل: 90 قرش اتساع + 2 جنيه تنمية موارد.'],
 });
};

const calculateExecutionInterest = (input: CourtFeesInput): CourtFeesResult => {
 const amount = positive(input.values.interestAmount);
 const years = positive(input.values.interestYears);
 const interest = input.values.interestNature === 'civil' ? roundMoney(amount * 0.04 * years) : 0;
 const subjectTotal = roundMoney(interest);
 const amountTotal = roundMoney(amount + interest);
 const scope = input.values.interestNature === 'civil' ? 'total' : 'sharia';
 const relativeFee = getExecutionRelativeFee(amountTotal, scope, 'first');
 const servicesFee = roundMoney(relativeFee / 2);
 const fixedFee = getExecutionFixedFee(scope, 'first');
 const martyrStamp = input.values.interestNature === 'civil' ? MARTYR_STAMP : 0;
 const fees: FeeDetail[] = [
 { label: 'نسبي', amount: relativeFee },
 { label: 'خدمات', amount: servicesFee },
 { label: 'ثابت', amount: fixedFee },
 { label: 'دمغة توكيل', amount: POWER_OF_ATTORNEY_FEE },
 { label: 'دمغة الشهيد', amount: martyrStamp },
 ];

 return result('رسم تنفيذ بالفائدة القانونية', fees, {
 summaries: [
 { label: 'قيمة الفوائد', value: subjectTotal.toLocaleString('ar-EG') },
 { label: 'نسبي ع / خدمات ع', value: '0 / 0' },
 { label: 'إجمالي الموضوع', value: subjectTotal.toLocaleString('ar-EG') },
 { label: 'إجمالي المبلغ', value: amountTotal.toLocaleString('ar-EG'), tone: 'success' },
 ],
 notes: input.values.interestNature === 'civil' ? ['يتم احتساب الفائدة بواقع 4% سنويا في المسائل المدنية.'] : [],
 });
};

const calculateTreasurySupply = (input: CourtFeesInput): CourtFeesResult => {
 const collected = positive(input.values.treasuryCollectedAmount);
 const principal = positive(input.values.treasuryPrincipalAmount);
 const amountToSupply = positive(collected - principal);
 const preset = TREASURY_SUPPLY_PRESETS[input.values.treasuryKind];
 const fixedAndPower = preset.fixedFee + preset.powerOfAttorneyFee;
 const relativeFee = roundMoney(positive(amountToSupply - fixedAndPower) / 1.5);
 const servicesFee = roundMoney(relativeFee / 2);
 const fees: FeeDetail[] = [
 { label: 'نسبي', amount: relativeFee },
 { label: 'خدمات', amount: servicesFee },
 { label: 'ثابت', amount: preset.fixedFee },
 { label: 'دمغة توكيل', amount: preset.powerOfAttorneyFee },
 ];

 return result('توريد المبالغ المحصلة للخزينة', fees, {
 totalPaid: null,
 summaries: [
 { label: 'فرق التوريد', value: amountToSupply.toLocaleString('ar-EG'), tone: 'success' },
 { label: 'عدد مرات التنفيذ', value: String(Math.max(Math.trunc(input.values.treasuryExecutionCount), 0)) },
 ],
 });
};

const dateDiffParts = (fromValue: string, toValue: string): { months: number; days: number } => {
 const from = new Date(fromValue);
 const to = new Date(toValue);
 if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) {
 return { months: 0, days: 0 };
 }

 let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
 let days = to.getDate() - from.getDate();

 if (days < 0) {
 months -= 1;
 const previousMonth = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
 days += previousMonth;
 }

 return { months: Math.max(months, 0), days: Math.max(days, 0) };
};

const calculateMaintenanceArrears = (input: CourtFeesInput): CourtFeesResult => {
 const { months, days } = dateDiffParts(input.values.maintenanceFrom, input.values.maintenanceTo);
 const monthlyAmount = positive(input.values.maintenanceMonthlyAmount);
 const arrearsAmount = roundMoney(monthlyAmount * months + (monthlyAmount / 30) * days);
 const isRepeat = input.values.maintenanceMode === 'repeat';
 const relativeFee = isRepeat ? Math.max(roundMoney(arrearsAmount * 0.001111111), 0.01) : roundMoney(arrearsAmount * 0.003333333);
 const servicesFee = isRepeat ? 0 : roundMoney(relativeFee / 2);
 const fixedFee = isRepeat ? 0.85 : 2.5;
 const fees: FeeDetail[] = [
 { label: 'نسبي', amount: relativeFee },
 { label: 'خدمات', amount: servicesFee },
 { label: 'ثابت', amount: fixedFee },
 { label: 'دمغة توكيل', amount: POWER_OF_ATTORNEY_FEE },
 { label: 'دمغة الشهيد', amount: 0 },
 ];

 return result('حساب رسم متجمد نفقة', fees, {
 summaries: [
 { label: 'عدد الشهور', value: String(months) },
 { label: 'عدد الأيام', value: String(days) },
 { label: 'إجمالي المبلغ', value: arrearsAmount.toLocaleString('ar-EG'), tone: 'success' },
 ],
 });
};

const calculateDeposit = (input: CourtFeesInput): CourtFeesResult => {
 const amount = positive(input.values.depositAmount);
 const relativeFee = roundMoney(amount * 0.01);
 const servicesFee = roundMoney(relativeFee / 2);
 const additionalFee = roundMoney(amount * 0.0005);
 const martyrStamp = amount > 0 ? MARTYR_STAMP : 0;
 const fees: FeeDetail[] = [
 { label: 'نسبي', amount: relativeFee },
 { label: 'خدمات', amount: servicesFee },
 { label: 'إضافي', amount: additionalFee },
 { label: 'دمغة الشهيد', amount: martyrStamp },
 ];
 const revenueTotal = total(fees);
 const depositValue = input.values.depositMode === 'deducted'
 ? roundMoney(positive(amount - relativeFee - servicesFee - additionalFee))
 : amount;

 return result('رسم الإيداع', fees, {
 totalPaid: roundMoney(depositValue + revenueTotal),
 summaries: [
 { label: 'الوديعة', value: depositValue.toLocaleString('ar-EG'), tone: 'success' },
 { label: 'إجمالي الإيراد', value: revenueTotal.toLocaleString('ar-EG'), tone: 'success' },
 ],
 });
};

const calculateSimpleWarning = (input: CourtFeesInput): CourtFeesResult => {
 const defendants = Math.max(Math.trunc(positive(input.values.warningDefendants)), 0);
 const rolls = Math.max(Math.trunc(positive(input.values.warningRolls)), 0);
 const prescribedFee = roundMoney(defendants * rolls * 0.3);
 const servicesFee = roundMoney(prescribedFee / 2);
 const additionalFee = input.values.warningLinkedDefendants ? 0 : defendants;
 const fees: FeeDetail[] = [
 { label: 'مقرر', amount: prescribedFee },
 { label: 'خدمات', amount: servicesFee },
 { label: 'إضافي', amount: additionalFee },
 ];

 return result('إنذار بسيط', fees, {
 notes: ['يمكنك الاختيار بين ارتباط أو عدم ارتباط المنذر إليهم.'],
 });
};

const calculateJudgmentAnnouncement = (input: CourtFeesInput): CourtFeesResult => {
 const rolls = Math.max(Math.trunc(positive(input.values.judgmentRolls)), 0);
 const recipients = Math.max(Math.trunc(positive(input.values.judgmentRecipients)), 0);
 const rate = JUDGMENT_ANNOUNCEMENT_RATES[input.values.judgmentKind];
 const prescribedFee = roundMoney(rolls * recipients * rate);
 const servicesFee = roundMoney(prescribedFee / 2);
 const fees: FeeDetail[] = [
 { label: 'مقرر', amount: prescribedFee },
 { label: 'خدمات', amount: servicesFee },
 { label: 'دمغة الشهيد', amount: MARTYR_STAMP },
 ];

 return result('رسم إعلان صورة حكم', fees);
};

const calculateCertificate = (input: CourtFeesInput): CourtFeesResult => {
 const count = Math.max(Math.trunc(positive(input.values.certificateCount)), 0);
 const years = Math.max(Math.trunc(positive(input.values.certificateYears)), 0);
 const persons = Math.max(Math.trunc(positive(input.values.certificatePersons)), 0);
 const prescribedFee = roundMoney(count * 0.5);
 const servicesFee = roundMoney(prescribedFee / 2);
 const additionalFee = roundMoney(persons * 1.5);
 const discoveryFee = roundMoney(years * 0.18);
 const certifiedPaperFee = input.values.includeCertifiedPaper ? count : 0;
 const stampFee = count * (input.values.certificateStakeholder ? 5 : 10);
 const fees: FeeDetail[] = [
 { label: 'مقرر', amount: prescribedFee },
 { label: 'خدمات', amount: servicesFee },
 { label: 'إضافي', amount: additionalFee },
 { label: 'رسم كشف', amount: discoveryFee },
 { label: 'ورق مؤمن', amount: certifiedPaperFee },
 { label: 'ميكنة', amount: stampFee },
 { label: 'دمغة الشهيد', amount: MARTYR_STAMP },
 ];

 return result('رسم شهادة', fees, {
 notes: ['يمكنك اختيار نوع الورق مؤمن أو غير مؤمن.'],
 });
};

const calculateOfficialCopy = (input: CourtFeesInput): CourtFeesResult => {
 const papers = Math.max(Math.trunc(positive(input.values.officialCopyPapers)), 0);
 const copies = Math.max(Math.trunc(positive(input.values.officialCopyCount)), 0);
 const prescribedFee = roundMoney(papers * 0.5);
 const servicesFee = roundMoney(prescribedFee / 2);
 const additionalFee = roundMoney(copies * 4);
 const certifiedPaperFee = input.values.includeOfficialCertifiedPaper ? papers : 0;
 const stampFee = papers * (input.values.officialCopyStakeholder ? 2 : 4);
 const fees: FeeDetail[] = [
 { label: 'مقرر', amount: prescribedFee },
 { label: 'خدمات', amount: servicesFee },
 { label: 'إضافي', amount: additionalFee },
 { label: 'ورق مؤمن', amount: certifiedPaperFee },
 { label: 'ميكنة', amount: stampFee },
 { label: 'دمغة الشهيد', amount: MARTYR_STAMP },
 ];

 return result('رسم صورة رسمية', fees, {
 notes: ['يمكنك اختيار نوع الورق مؤمن أو غير مؤمن.'],
 });
};

export function calculateCourtFees(input: CourtFeesInput): CourtFeesResult {
 switch (input.toolId) {
 case 'civil-known':
 return calculateCivilKnown(input.values.lawsuitAmount);
 case 'civil-unknown':
 return calculateCivilUnknown(input);
 case 'family-known':
 return calculateFamilyKnown(input.values.lawsuitAmount);
 case 'execution-basic':
 return calculateExecution(input);
 case 'execution-interest':
 return calculateExecutionInterest(input);
 case 'treasury-supply':
 return calculateTreasurySupply(input);
 case 'maintenance-arrears':
 return calculateMaintenanceArrears(input);
 case 'deposit':
 return calculateDeposit(input);
 case 'simple-warning':
 return calculateSimpleWarning(input);
 case 'judgment-announcement':
 return calculateJudgmentAnnouncement(input);
 case 'certificate':
 return calculateCertificate(input);
 case 'official-copy':
 return calculateOfficialCopy(input);
 default:
 return result('حاسبة الرسوم القضائية', [], { notes: ['نوع الرسم غير معروف.'] });
 }
}
