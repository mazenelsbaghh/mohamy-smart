import { CustomCard, CustomInput, Container } from'@mohamy/shared-ui';
import'./CourtFeesCalculator.css';
import { useMemo, useState } from'react';

import HeadTitle from'../../components/headTitle/HeadTitle';


import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Select, SelectItem, Checkbox } from'@heroui/react';
import { tableClassNames } from'@mohamy/shared-ui';
import type { CourtFeesInput } from'./engine/courtFeesTypes';
import { CaseType } from'./engine/courtFeesTypes';
import { CASE_TYPES } from'./engine/courtFeesData';
import { calculateCourtFees } from'./engine/courtFesEngine';

const formatCurrency = (value: number): string => {
 return value.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const CourtFeesCalculator = () => {
 const [input, setInput] = useState<CourtFeesInput>({
 caseType:'',
 claimValue: 0,
 isAppeal: false,
 isCassation: false,
 });
 const [errors, setErrors] = useState<string[]>([]);

 const result = useMemo(() => {
 setErrors([]);
 const validationErrors: string[] = [];

 if (!input.caseType) {
 return null;
 }

 const caseInfo = CASE_TYPES.find(c => c.type === input.caseType);
 if (caseInfo && !caseInfo.isExempt && caseInfo.feeCategory ==='progressive' && input.claimValue <= 0) {
 validationErrors.push('يرجى إدخال قيمة الدعوى');
 }

 if (validationErrors.length > 0) {
 setErrors(validationErrors);
 return null;
 }

 return calculateCourtFees(input);
 }, [input]);


 return (
 <section className="court-fees-calculator">
 <Container>
 <HeadTitle title="حاسبة الرسوم القضائية" />

 <CustomCard className="case-info-card">
 <div className="head">
 <h3>بيانات الدعوى</h3>
 </div>
 <div className="case-inputs">
 <div>
 <Select
 label="نوع الدعوى"
 placeholder="اختر نوع الدعوى"
 selectedKeys={input.caseType ? [input.caseType] : []}
 onSelectionChange={(keys) => {
 const val = Array.from(keys as Set<string>)[0];
 setInput({ ...input, caseType: (val ||'') as CaseType &'' });
 }}
 className="w-full"
 variant="bordered"
 >
 {CASE_TYPES.map(ct => (
 <SelectItem key={ct.type}>{ct.arabicLabel}</SelectItem>
 ))}
 </Select>
 </div>
 <CustomInput
 type="number"
 label="قيمة الحق المدعى به (جنيه)"
 placeholder="أدخل قيمة الدعوى"
 value={input.claimValue > 0 ? input.claimValue.toString() :''}
 onChange={(e) => setInput({ ...input, claimValue: parseFloat(e.target.value) || 0 })}
 isInvalid={input.caseType !=='' && input.claimValue <= 0 && !CASE_TYPES.find(c => c.type === input.caseType)?.isExempt && CASE_TYPES.find(c => c.type === input.caseType)?.feeCategory ==='progressive'}
 errorMessage={input.claimValue <= 0 ?'يرجى إدخال قيمة أكبر من صفر' : undefined}
 />
 </div>
 <div className="toggle-row">
 <div className="toggle-item">
 <Checkbox
 isSelected={input.isAppeal}
 onValueChange={(isSelected) => setInput({ ...input, isAppeal: isSelected, isCassation: isSelected ? false : input.isCassation })}
 >
 استئناف
 </Checkbox>
 </div>
 <div className="toggle-item">
 <Checkbox
 isSelected={input.isCassation}
 onValueChange={(isSelected) => setInput({ ...input, isCassation: isSelected, isAppeal: isSelected ? false : input.isAppeal })}
 >
 نقض
 </Checkbox>
 </div>
 </div>

 {errors.length > 0 && (
 <div className="error-message">
 {errors.map((err, i) => <p key={i}>{err}</p>)}
 </div>
 )}
 </CustomCard>

 <CustomCard className="results-card">
 <div className="head">
 <h3>نتيجة حساب الرسوم</h3>
 </div>

 {!result ? (
 <div className="empty-results">
 {!input.caseType
 ?'اختر نوع الدعوى لحساب الرسوم'
 :'أدخل قيمة الدعوى لحساب الرسوم'
 }
 </div>
 ) : result.isExempt ? (
 <div className="exempt-notice">
 <h4>✓ معفاة من الرسوم</h4>
 <p>{result.exemptionReason}</p>
 </div>
 ) : (
 <>
 <Table aria-label="نتيجة حساب الرسوم" classNames={tableClassNames} removeWrapper>
 <TableHeader>
 <TableColumn>نوع الرسم</TableColumn>
 <TableColumn>المبلغ</TableColumn>
 <TableColumn>السند القانوني</TableColumn>
 </TableHeader>
 <TableBody>
 {[
 ...result.fees.map((fee, index) => (
 <TableRow key={`fee-${index}`}>
 <TableCell>{fee.feeType}</TableCell>
 <TableCell>{formatCurrency(fee.amount)} ج.م</TableCell>
 <TableCell className="text-xs opacity-70">{fee.legalBasis}</TableCell>
 </TableRow>
 )),
 <TableRow key="total" className="total-row font-bold bg-primary/10">
 <TableCell>الإجمالي</TableCell>
 <TableCell>{formatCurrency(result.totalFees)} ج.م</TableCell>
 <TableCell> </TableCell>
 </TableRow>
 ]}
 </TableBody>
 </Table>

 {result.warnings.length > 0 && (
 <div className="warnings-list">
 {result.warnings.map((w, i) => <p key={i}>⚠ {w}</p>)}
 </div>
 )}
 </>
 )}
 </CustomCard>
 </Container>
 </section>
 );
};

export default CourtFeesCalculator;
