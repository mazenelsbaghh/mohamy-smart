import { CustomCard, CustomInput, Container } from'@mohamy/shared-ui';
import'./InheritanceCalculator.css';
import { useMemo, useState } from'react';
import { IoAdd, IoRemove, IoClose } from'react-icons/io5';

import HeadTitle from'../../components/headTitle/HeadTitle';


import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Select, SelectItem } from'@heroui/react';
import { tableClassNames } from'@mohamy/shared-ui';
import type { EstateInput, HeirInput } from'./engine/inheritanceTypes';
import { HeirType } from'./engine/inheritanceTypes';
import { HEIR_CATEGORIES, getHeirLabel } from'./engine/inheritanceData';
import { calculateInheritance } from'./engine/inheritanceEngine';

const formatCurrency = (value: number): string => {
 return value.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const InheritanceCalculator = () => {
 const [estate, setEstate] = useState<EstateInput>({ totalValue: 0, debts: 0, bequests: 0 });
 const [heirs, setHeirs] = useState<HeirInput[]>([]);
 const [selectedHeirType, setSelectedHeirType] = useState<HeirType>(HeirType.SON);
 const [errors, setErrors] = useState<string[]>([]);

 const result = useMemo(() => {
 setErrors([]);
 const validationErrors: string[] = [];

 if (estate.totalValue <= 0 && heirs.length > 0) {
 validationErrors.push('يرجى إدخال قيمة التركة');
 }

 if (estate.bequests > 0 && estate.totalValue > 0) {
 const maxBequest = (estate.totalValue - estate.debts) / 3;
 if (estate.bequests > maxBequest) {
 validationErrors.push(`الوصية الحد الأقصى ${formatCurrency(maxBequest)} جنيه (ثلث صافي التركة)`);
 }
 }

 if (validationErrors.length > 0) {
 setErrors(validationErrors);
 return null;
 }

 if (estate.totalValue <= 0 || heirs.length === 0) return null;

 return calculateInheritance(estate, heirs);
 }, [estate, heirs]);

 const addHeir = () => {
 const existing = heirs.find(h => h.type === selectedHeirType);
 const category = HEIR_CATEGORIES.find(c => c.type === selectedHeirType);

 if (existing) {
 if (category?.maxCount && existing.count >= category.maxCount) {
 setErrors([`الحد الأقصى لـ ${getHeirLabel(selectedHeirType)} هو ${category.maxCount}`]);
 return;
 }
 setHeirs(heirs.map(h => h.type === selectedHeirType ? { ...h, count: h.count + 1 } : h));
 } else {
 setHeirs([...heirs, { type: selectedHeirType, count: 1 }]);
 }
 setErrors([]);
 };

 const removeHeir = (type: HeirType) => {
 setHeirs(heirs.filter(h => h.type !== type));
 };

 const incrementHeir = (type: HeirType) => {
 const category = HEIR_CATEGORIES.find(c => c.type === type);
 const heir = heirs.find(h => h.type === type);
 if (heir && category?.maxCount && heir.count >= category.maxCount) return;
 setHeirs(heirs.map(h => h.type === type ? { ...h, count: h.count + 1 } : h));
 };

 const decrementHeir = (type: HeirType) => {
 const heir = heirs.find(h => h.type === type);
 if (!heir) return;
 if (heir.count <= 1) {
 removeHeir(type);
 } else {
 setHeirs(heirs.map(h => h.type === type ? { ...h, count: h.count - 1 } : h));
 }
 };

 const getShareTypeLabel = (type: string): string => {
 switch (type) {
 case'fard': return'فرض';
 case'fard_radd': return'فرض + رد';
 case"ta'sib": return'تعصيب';
 case'radd': return'رد';
 case'wasiyya_wajiba': return'وصية واجبة';
 default: return type;
 }
 };

 const getShareTypeBadgeClass = (type: string): string => {
 switch (type) {
 case'fard': return'share-type-fard';
 case'fard_radd': return'share-type-radd';
 case"ta'sib": return'share-type-tasib';
 case'radd': return'share-type-radd';
 case'wasiyya_wajiba': return'share-type-wasiyya';
 default: return'';
 }
 };

 return (
 <section className="inheritance-calculator">
 <Container>
 <HeadTitle title="حاسبة المواريث" />

 <CustomCard className="estate-card">
 <div className="head">
 <h3>بيانات التركة</h3>
 </div>
 <div className="estate-inputs">
 <CustomInput
 type="number"
 label="قيمة التركة (جنيه)"
 placeholder="أدخل قيمة التركة"
 value={estate.totalValue > 0 ? estate.totalValue.toString() :''}
 onChange={(e) => setEstate({ ...estate, totalValue: parseFloat(e.target.value) || 0 })}
 />
 <CustomInput
 type="number"
 label="الديون (جنيه)"
 placeholder="أدخل قيمة الديون"
 value={estate.debts > 0 ? estate.debts.toString() :''}
 onChange={(e) => setEstate({ ...estate, debts: parseFloat(e.target.value) || 0 })}
 />
 <CustomInput
 type="number"
 label="الوصية (جنيه)"
 placeholder="أدخل قيمة الوصية (الحد الأقصى ثلث التركة)"
 value={estate.bequests > 0 ? estate.bequests.toString() :''}
 onChange={(e) => setEstate({ ...estate, bequests: parseFloat(e.target.value) || 0 })}
 />
 </div>
 </CustomCard>

 <CustomCard className="heir-card">
 <div className="head">
 <h3>الورثة</h3>
 </div>
 <div className="add-heir-section">
 <Select
 label="اختر الوارث"
 placeholder="اختر الوارث..."
 selectedKeys={[selectedHeirType]}
 onSelectionChange={(keys) => {
 const val = Array.from(keys as Set<string>)[0];
 if (val) setSelectedHeirType(val as HeirType);
 }}
 className="w-full sm:w-auto min-w-[200px]"
 variant="bordered"
 >
 {HEIR_CATEGORIES.map(cat => (
 <SelectItem key={cat.type}>{cat.arabicLabel}</SelectItem>
 ))}
 </Select>
 <button onClick={addHeir} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold bg-[var(--main-color)] hover:opacity-90 transition-opacity">
 <IoAdd /> إضافة وارث
 </button>
 </div>

 {heirs.length > 0 && (
 <div className="heir-list">
 {heirs.map(heir => (
 <div key={heir.type} className="heir-item">
 <span className="heir-label">{getHeirLabel(heir.type)}</span>
 <div className="heir-count-controls">
 <button className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="إنقاص" onClick={() => decrementHeir(heir.type)}><IoRemove size={16} /></button>
 <span>{heir.count}</span>
 <button className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="إضافة" onClick={() => incrementHeir(heir.type)}><IoAdd size={16} /></button>
 </div>
 <button className="remove-heir p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-[var(--danger-color)] rounded-lg transition-colors" aria-label="حذف" onClick={() => removeHeir(heir.type)}><IoClose size={16} /></button>
 </div>
 ))}
 </div>
 )}

 {errors.length > 0 && (
 <div className="error-message">
 {errors.map((err, i) => <p key={i}>{err}</p>)}
 </div>
 )}
 </CustomCard>

 <CustomCard className="results-card">
 <div className="head">
 <h3>نتيجة توزيع التركة</h3>
 </div>

 {!result || result.shares.length === 0 ? (
 <div className="empty-results">
 {heirs.length === 0
 ?'أضف الورثة لحساب الأنصبة'
 : estate.totalValue <= 0
 ?'أدخل قيمة التركة لحساب الأنصبة'
 :'لا يوجد ورثة مستحقون'
 }
 </div>
 ) : (
 <>
 <Table aria-label="نتيجة توزيع التركة" classNames={tableClassNames} removeWrapper>
 <TableHeader>
 <TableColumn>الوارث</TableColumn>
 <TableColumn>العدد</TableColumn>
 <TableColumn>نوع السهم</TableColumn>
 <TableColumn>النصيب</TableColumn>
 <TableColumn>للفرد</TableColumn>
 <TableColumn>النسبة</TableColumn>
 <TableColumn>السند الشرعي</TableColumn>
 </TableHeader>
 <TableBody items={Array.isArray(result.shares) ? result.shares : []}>
 {(share) => (
 <TableRow key={`${share.heirType}-${share.count}`}>
 <TableCell>{getHeirLabel(share.heirType)}</TableCell>
 <TableCell>{share.count}</TableCell>
 <TableCell>
 <span className={`share-type-badge ${getShareTypeBadgeClass(share.shareType)}`}>
 {getShareTypeLabel(share.shareType)}
 </span>
 {share.fraction && <span className="me-1 text-xs opacity-60">({share.fraction})</span>}
 </TableCell>
 <TableCell>{formatCurrency(share.totalAmount)} ج.م</TableCell>
 <TableCell>{formatCurrency(share.perPersonAmount)} ج.م</TableCell>
 <TableCell>{share.percentage.toFixed(2)}%</TableCell>
 <TableCell className="text-xs opacity-70">{share.legalBasis}</TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>

 <div className="results-summary">
 <div className="summary-item">
 <span className="summary-label">إجمالي التركة</span>
 <span className="summary-value">{formatCurrency(estate.totalValue)} ج.م</span>
 </div>
 {estate.debts > 0 && (
 <div className="summary-item">
 <span className="summary-label">الديون</span>
 <span className="summary-value" style={{ color:'var(--danger-color)' }}>-{formatCurrency(estate.debts)} ج.م</span>
 </div>
 )}
 <div className="summary-item">
 <span className="summary-label">الموزّع</span>
 <span className="summary-value">{formatCurrency(result.totalDistributed)} ج.م</span>
 </div>
 {result.remainingEstate > 0 && (
 <div className="summary-item">
 <span className="summary-label">المتبقي</span>
 <span className="summary-value">{formatCurrency(result.remainingEstate)} ج.م</span>
 </div>
 )}
 {result.isOversubscribed && result.awlRate && (
 <div className="summary-item">
 <span className="summary-label">نسبة العول</span>
 <span className="summary-value">{(result.awlRate * 100).toFixed(2)}%</span>
 </div>
 )}
 </div>

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

export default InheritanceCalculator;
