import { Checkbox, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { CustomCard, CustomInput, Container, tableClassNames } from '@mohamy/shared-ui';
import './CourtFeesCalculator.css';
import { useMemo, useState } from 'react';

import HeadTitle from '../../components/headTitle/HeadTitle';

import {
 CIVIL_UNKNOWN_OPTIONS,
 COURT_FEE_SECTIONS,
 JUDGMENT_ANNOUNCEMENT_OPTIONS,
 TREASURY_SUPPLY_OPTIONS,
} from './engine/courtFeesData';
import type {
 CivilUnknownKind,
 CourtFeesFormValues,
 ExecutionRound,
 ExecutionScope,
 FeeSectionId,
 FeeToolId,
 InterestNature,
 JudgmentAnnouncementKind,
 MaintenanceMode,
 TreasurySupplyKind,
} from './engine/courtFeesTypes';
import { calculateCourtFees } from './engine/courtFesEngine';

const today = new Date().toISOString().slice(0, 10);

const initialValues: CourtFeesFormValues = {
 lawsuitAmount: 1000,
 civilUnknownKind: 'urgent-partial',
 executionAmount: 1000,
 executionScope: 'total',
 executionRound: 'first',
 includeExecutionFixed: true,
 includeExecutionPowerOfAttorney: true,
 includeExecutionMartyrStamp: true,
 interestAmount: 1000,
 interestYears: 0,
 interestNature: 'civil',
 treasuryCollectedAmount: 2000,
 treasuryPrincipalAmount: 1000,
 treasuryExecutionCount: 1,
 treasuryKind: 'partial',
 maintenanceMonthlyAmount: 1000,
 maintenanceFrom: today,
 maintenanceTo: today,
 maintenanceMode: 'first',
 depositAmount: 1000,
 depositMode: 'deducted',
 warningDefendants: 1,
 warningRolls: 1,
 warningLinkedDefendants: false,
 judgmentRolls: 100,
 judgmentRecipients: 2,
 judgmentKind: 'civil-appeal',
 certificateCount: 5,
 certificateYears: 10,
 certificatePersons: 2,
 certificateStakeholder: false,
 includeCertifiedPaper: false,
 officialCopyPapers: 10,
 officialCopyCount: 2,
 officialCopyStakeholder: true,
 includeOfficialCertifiedPaper: false,
};

const formatCurrency = (value: number): string =>
 value.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const toNumber = (value: string): number => Number.parseFloat(value) || 0;
const toInteger = (value: string): number => Math.max(Math.trunc(Number.parseFloat(value) || 0), 0);

interface Choice<T extends string> {
 id: T;
 label: string;
}

interface ChoiceGroupProps<T extends string> {
 label: string;
 value: T;
 options: Array<Choice<T>>;
 onChange: (value: T) => void;
 columns?: 'two' | 'three';
}

function ChoiceGroup<T extends string>({ label, value, options, onChange, columns = 'two' }: ChoiceGroupProps<T>) {
 return (
 <div className="fee-choice-block">
 <span className="fee-choice-label">{label}</span>
 <div className={`fee-choice-grid is-${columns}`}>
 {options.map(option => (
 <button
 key={option.id}
 type="button"
 className={`fee-choice ${value === option.id ? 'is-active' : ''}`}
 onClick={() => onChange(option.id)}
 >
 {option.label}
 </button>
 ))}
 </div>
 </div>
 );
}

const CourtFeesCalculator = () => {
 const [activeSectionId, setActiveSectionId] = useState<FeeSectionId>('lawsuit');
 const [activeToolId, setActiveToolId] = useState<FeeToolId>('civil-known');
 const [values, setValues] = useState<CourtFeesFormValues>(initialValues);

 const activeSection = COURT_FEE_SECTIONS.find(section => section.id === activeSectionId) ?? COURT_FEE_SECTIONS[0];
 const result = useMemo(() => calculateCourtFees({ toolId: activeToolId, values }), [activeToolId, values]);

 const setValue = <K extends keyof CourtFeesFormValues>(key: K, value: CourtFeesFormValues[K]) => {
 setValues(current => ({ ...current, [key]: value }));
 };

 const selectSection = (sectionId: FeeSectionId) => {
 const section = COURT_FEE_SECTIONS.find(item => item.id === sectionId);
 if (!section) return;

 setActiveSectionId(section.id);
 setActiveToolId(section.tools[0].id);
 };

 const setExecutionScope = (scope: ExecutionScope) => {
 setValues(current => ({
 ...current,
 executionScope: scope,
 includeExecutionFixed: true,
 includeExecutionMartyrStamp: scope !== 'sharia' && current.executionRound === 'first',
 }));
 };

 const setExecutionRound = (round: ExecutionRound) => {
 setValues(current => ({
 ...current,
 executionRound: round,
 includeExecutionFixed: true,
 includeExecutionMartyrStamp: current.executionScope !== 'sharia' && round === 'first',
 }));
 };

 const renderToolSelector = () => {
 if (activeSection.tools.length <= 1) return null;

 return (
 <div className="fee-tool-tabs" role="tablist" aria-label="أنواع الرسم">
 {activeSection.tools.map(tool => (
 <button
 key={tool.id}
 type="button"
 className={`fee-tool-tab ${activeToolId === tool.id ? 'is-active' : ''}`}
 onClick={() => setActiveToolId(tool.id)}
 role="tab"
 aria-selected={activeToolId === tool.id}
 >
 {tool.title}
 </button>
 ))}
 </div>
 );
 };

 const renderInputs = () => {
 switch (activeToolId) {
 case 'civil-known':
 case 'family-known':
 return (
 <div className="fee-form-grid">
 <CustomInput
 type="number"
 label="المبلغ المراد"
 value={values.lawsuitAmount.toString()}
 onChange={(event) => setValue('lawsuitAmount', toNumber(event.target.value))}
 />
 </div>
 );

 case 'civil-unknown':
 return (
 <ChoiceGroup<CivilUnknownKind>
 label="اختر الدعوى"
 value={values.civilUnknownKind}
 options={CIVIL_UNKNOWN_OPTIONS}
 onChange={(value) => setValue('civilUnknownKind', value)}
 columns="three"
 />
 );

 case 'execution-basic':
 return (
 <>
 <div className="fee-form-grid">
 <CustomInput
 type="number"
 label="المبلغ"
 value={values.executionAmount.toString()}
 onChange={(event) => setValue('executionAmount', toNumber(event.target.value))}
 />
 </div>
 <ChoiceGroup<ExecutionScope>
 label="نوع التنفيذ"
 value={values.executionScope}
 options={[
 { id: 'total', label: 'كلي' },
 { id: 'partial', label: 'جزئي' },
 { id: 'sharia', label: 'تنفيذ شرعي' },
 ]}
 onChange={setExecutionScope}
 />
 <ChoiceGroup<ExecutionRound>
 label="المرة"
 value={values.executionRound}
 options={[
 { id: 'first', label: 'أول مرة' },
 { id: 'repeat', label: 'إعادة' },
 ]}
 onChange={setExecutionRound}
 />
 <div className="fee-checkbox-grid">
 <Checkbox isSelected={values.includeExecutionFixed} onValueChange={(checked) => setValue('includeExecutionFixed', checked)}>ثابت</Checkbox>
 <Checkbox isSelected={values.includeExecutionPowerOfAttorney} onValueChange={(checked) => setValue('includeExecutionPowerOfAttorney', checked)}>دمغة توكيل</Checkbox>
 <Checkbox isSelected={values.includeExecutionMartyrStamp} onValueChange={(checked) => setValue('includeExecutionMartyrStamp', checked)}>دمغة الشهيد</Checkbox>
 </div>
 </>
 );

 case 'execution-interest':
 return (
 <>
 <div className="fee-form-grid">
 <CustomInput
 type="number"
 label="المبلغ المنفذ به"
 value={values.interestAmount.toString()}
 onChange={(event) => setValue('interestAmount', toNumber(event.target.value))}
 />
 <CustomInput
 type="number"
 label="المدة بالسنوات"
 value={values.interestYears.toString()}
 onChange={(event) => setValue('interestYears', toNumber(event.target.value))}
 />
 </div>
 <ChoiceGroup<InterestNature>
 label="طبيعة التنفيذ"
 value={values.interestNature}
 options={[
 { id: 'civil', label: 'مدني' },
 { id: 'sharia', label: 'شرعي' },
 ]}
 onChange={(value) => setValue('interestNature', value)}
 />
 </>
 );

 case 'treasury-supply':
 return (
 <>
 <div className="fee-form-grid">
 <CustomInput
 type="number"
 label="المبلغ المحصل"
 value={values.treasuryCollectedAmount.toString()}
 onChange={(event) => setValue('treasuryCollectedAmount', toNumber(event.target.value))}
 />
 <CustomInput
 type="number"
 label="أصل المبلغ"
 value={values.treasuryPrincipalAmount.toString()}
 onChange={(event) => setValue('treasuryPrincipalAmount', toNumber(event.target.value))}
 />
 <CustomInput
 type="number"
 label="عدد مرات التنفيذ"
 value={values.treasuryExecutionCount.toString()}
 onChange={(event) => setValue('treasuryExecutionCount', toInteger(event.target.value))}
 />
 </div>
 <ChoiceGroup<TreasurySupplyKind>
 label="نوع التوريد"
 value={values.treasuryKind}
 options={TREASURY_SUPPLY_OPTIONS}
 onChange={(value) => setValue('treasuryKind', value)}
 />
 </>
 );

 case 'maintenance-arrears':
 return (
 <>
 <div className="fee-form-grid">
 <CustomInput
 type="number"
 label="النفقة الشهرية"
 value={values.maintenanceMonthlyAmount.toString()}
 onChange={(event) => setValue('maintenanceMonthlyAmount', toNumber(event.target.value))}
 />
 <CustomInput
 type="date"
 label="ابتداء من"
 value={values.maintenanceFrom}
 onChange={(event) => setValue('maintenanceFrom', event.target.value)}
 />
 <CustomInput
 type="date"
 label="حتى"
 value={values.maintenanceTo}
 onChange={(event) => setValue('maintenanceTo', event.target.value)}
 />
 </div>
 <ChoiceGroup<MaintenanceMode>
 label="نوع الرسم"
 value={values.maintenanceMode}
 options={[
 { id: 'first', label: 'تنفيذ' },
 { id: 'repeat', label: 'إعادة' },
 ]}
 onChange={(value) => setValue('maintenanceMode', value)}
 />
 </>
 );

 case 'deposit':
 return (
 <>
 <div className="fee-form-grid">
 <CustomInput
 type="number"
 label="المبلغ المعروض"
 value={values.depositAmount.toString()}
 onChange={(event) => setValue('depositAmount', toNumber(event.target.value))}
 />
 </div>
 <ChoiceGroup
 label="طريقة التحميل"
 value={values.depositMode}
 options={[
 { id: 'requester', label: 'على عاتق الطالب' },
 { id: 'deducted', label: 'خصما من المبلغ المعروض' },
 ]}
 onChange={(value) => setValue('depositMode', value)}
 />
 </>
 );

 case 'simple-warning':
 return (
 <>
 <div className="fee-form-grid">
 <CustomInput
 type="number"
 label="عدد المنذر إليهم"
 value={values.warningDefendants.toString()}
 onChange={(event) => setValue('warningDefendants', toInteger(event.target.value))}
 />
 <CustomInput
 type="number"
 label="عدد رولات الإنذار"
 value={values.warningRolls.toString()}
 onChange={(event) => setValue('warningRolls', toInteger(event.target.value))}
 />
 </div>
 <div className="fee-checkbox-grid">
 <Checkbox isSelected={values.warningLinkedDefendants} onValueChange={(checked) => setValue('warningLinkedDefendants', checked)}>
 حالة ارتباط المنذر إليهم
 </Checkbox>
 </div>
 </>
 );

 case 'judgment-announcement':
 return (
 <>
 <div className="fee-form-grid">
 <CustomInput
 type="number"
 label="عدد رولات الحكم"
 value={values.judgmentRolls.toString()}
 onChange={(event) => setValue('judgmentRolls', toInteger(event.target.value))}
 />
 <CustomInput
 type="number"
 label="عدد المعلن إليهم"
 value={values.judgmentRecipients.toString()}
 onChange={(event) => setValue('judgmentRecipients', toInteger(event.target.value))}
 />
 </div>
 <ChoiceGroup<JudgmentAnnouncementKind>
 label="نوع الحكم"
 value={values.judgmentKind}
 options={JUDGMENT_ANNOUNCEMENT_OPTIONS}
 onChange={(value) => setValue('judgmentKind', value)}
 />
 </>
 );

 case 'certificate':
 return (
 <>
 <div className="fee-form-grid">
 <CustomInput
 type="number"
 label="عدد الشهادات"
 value={values.certificateCount.toString()}
 onChange={(event) => setValue('certificateCount', toInteger(event.target.value))}
 />
 <CustomInput
 type="number"
 label="عدد السنوات"
 value={values.certificateYears.toString()}
 onChange={(event) => setValue('certificateYears', toInteger(event.target.value))}
 />
 <CustomInput
 type="number"
 label="عدد الأفراد"
 value={values.certificatePersons.toString()}
 onChange={(event) => setValue('certificatePersons', toInteger(event.target.value))}
 />
 </div>
 <ChoiceGroup
 label="صفة الطالب"
 value={values.certificateStakeholder ? 'stakeholder' : 'other'}
 options={[
 { id: 'stakeholder', label: 'ذوي الشأن' },
 { id: 'other', label: 'غير ذوي الشأن' },
 ]}
 onChange={(value) => setValue('certificateStakeholder', value === 'stakeholder')}
 />
 <div className="fee-checkbox-grid">
 <Checkbox isSelected={values.includeCertifiedPaper} onValueChange={(checked) => setValue('includeCertifiedPaper', checked)}>ورق مؤمن</Checkbox>
 </div>
 </>
 );

 case 'official-copy':
 return (
 <>
 <div className="fee-form-grid">
 <CustomInput
 type="number"
 label="عدد الأوراق"
 value={values.officialCopyPapers.toString()}
 onChange={(event) => setValue('officialCopyPapers', toInteger(event.target.value))}
 />
 <CustomInput
 type="number"
 label="عدد الصور"
 value={values.officialCopyCount.toString()}
 onChange={(event) => setValue('officialCopyCount', toInteger(event.target.value))}
 />
 </div>
 <ChoiceGroup
 label="صفة الطالب"
 value={values.officialCopyStakeholder ? 'stakeholder' : 'other'}
 options={[
 { id: 'stakeholder', label: 'ذوي الشأن' },
 { id: 'other', label: 'غير ذوي الشأن' },
 ]}
 onChange={(value) => setValue('officialCopyStakeholder', value === 'stakeholder')}
 />
 <div className="fee-checkbox-grid">
 <Checkbox isSelected={values.includeOfficialCertifiedPaper} onValueChange={(checked) => setValue('includeOfficialCertifiedPaper', checked)}>ورق مؤمن</Checkbox>
 </div>
 </>
 );

 default:
 return null;
 }
 };

 const resultRows = [
 ...result.fees.map((fee, index) => (
 <TableRow key={`${fee.label}-${index}`} className={fee.tone ? `fee-row-${fee.tone}` : undefined}>
 <TableCell>{fee.label}</TableCell>
 <TableCell>{formatCurrency(fee.amount)} ج.م</TableCell>
 </TableRow>
 )),
 <TableRow key="total-fees" className="fee-row-success total-row">
 <TableCell>الإجمالي</TableCell>
 <TableCell>{formatCurrency(result.totalFees)} ج.م</TableCell>
 </TableRow>,
 ...(result.totalPaid !== null && result.totalPaid !== result.totalFees ? [
 <TableRow key="total-paid" className="fee-row-success total-paid-row">
 <TableCell>إجمالي المدفوع</TableCell>
 <TableCell>{formatCurrency(result.totalPaid)} ج.م</TableCell>
 </TableRow>,
 ] : []),
 ];

 return (
 <section className="court-fees-calculator">
 <Container>
 <HeadTitle title="حاسبة الرسوم القضائية" />

 <div className="fee-shell">
 <aside className="fee-sections" aria-label="أقسام الرسوم">
 {COURT_FEE_SECTIONS.map(section => (
 <button
 key={section.id}
 type="button"
 className={`fee-section-button ${activeSectionId === section.id ? 'is-active' : ''}`}
 onClick={() => selectSection(section.id)}
 >
 <span>{section.title}</span>
 <small>{section.tools.length}</small>
 </button>
 ))}
 </aside>

 <div className="fee-workspace">
 <CustomCard className="fee-panel">
 <div className="fee-panel-head">
 <div>
 <h3>{activeSection.title}</h3>
 <p>{result.title}</p>
 </div>
 </div>

 {renderToolSelector()}
 <div className="fee-form">{renderInputs()}</div>
 </CustomCard>

 <CustomCard className="fee-panel result-panel">
 <div className="fee-panel-head">
 <div>
 <h3>نتيجة الحساب</h3>
 <p>{result.title}</p>
 </div>
 </div>

 {result.summaries.length > 0 && (
 <div className="fee-summary-grid">
 {result.summaries.map(item => (
 <div key={`${item.label}-${item.value}`} className={`fee-summary-item ${item.tone ? `is-${item.tone}` : ''}`}>
 <span>{item.label}</span>
 <strong>{item.value}</strong>
 </div>
 ))}
 </div>
 )}

 <Table aria-label="نتيجة حساب الرسوم" classNames={tableClassNames} removeWrapper>
 <TableHeader>
 <TableColumn>البند</TableColumn>
 <TableColumn>القيمة</TableColumn>
 </TableHeader>
 <TableBody>{resultRows}</TableBody>
 </Table>

 {result.jurisdiction && <div className="fee-jurisdiction">{result.jurisdiction}</div>}

 {result.notes.length > 0 && (
 <div className="fee-notes">
 {result.notes.map(note => <p key={note}>{note}</p>)}
 </div>
 )}
 </CustomCard>
 </div>
 </div>
 </Container>
 </section>
 );
};

export default CourtFeesCalculator;
