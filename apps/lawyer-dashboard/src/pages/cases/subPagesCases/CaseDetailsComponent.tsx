import { Button, Select, SelectItem } from'@heroui/react';
import { CustomCard } from'@mohamy/shared-ui';
import { useEffect, useMemo, useState } from'react';
import { Save } from 'lucide-react';
import { sileo } from'sileo';
import { useAppDispatch, useAppSelector } from'../../../hooks/reduxHooks';
import { setSingleCase, type TCase } from'../../../redux/cases/casesSlice';
import {
 fetchInternalRegulations,
 updateCaseInternalRegulations,
} from'../../../redux/internalRegulations/internalRegulationsSlice';

type TCaseDetailsComponent = {
 singleCase: TCase;
}

const creationDateFormatter = new Intl.DateTimeFormat('en-CA', {
 year:'numeric',
 month:'2-digit',
 day:'2-digit',
});

const CaseDetailsComponent = ({ singleCase }: TCaseDetailsComponent) => {
 const dispatch = useAppDispatch();
 const { regulations: internalRegulations } = useAppSelector((state) => state.internalRegulations);
 const linkedRegulations = singleCase.internalRegulations ?? [];
 const [selectedRegulationIds, setSelectedRegulationIds] = useState<string[]>([]);
 const [savingReferences, setSavingReferences] = useState(false);

 useEffect(() => {
 if (internalRegulations.length === 0) {
 dispatch(fetchInternalRegulations({ page: 1, pageSize: 200 }));
 }
 }, [dispatch, internalRegulations.length]);

 useEffect(() => {
 setSelectedRegulationIds(
 linkedRegulations
 .filter((regulation) => regulation.isActive)
 .map((regulation) => regulation.id)
 );
 }, [linkedRegulations]);

 const activeRegulations = useMemo(
 () => internalRegulations.filter((regulation) => regulation.isActive),
 [internalRegulations]
 );

 const handleSaveReferences = async () => {
 setSavingReferences(true);
 try {
 const updatedCase = await dispatch(updateCaseInternalRegulations({
 caseId: String(singleCase.id),
 internalRegulationIds: selectedRegulationIds,
 })).unwrap();
 dispatch(setSingleCase(updatedCase));
 sileo.success({ title:'تم تحديث اللوائح الداخلية للقضية' });
 } catch (error) {
 sileo.error({ title: typeof error ==='string' ? error :'تعذّر تحديث اللوائح الداخلية للقضية' });
 } finally {
 setSavingReferences(false);
 }
 };

 return (
 <div className='flex flex-col gap-6'>
 {/* Main Info Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 <CustomCard className="border app-border shadow-sm transition-shadow">
 <h5 className="text-sm app-text-subtle mb-2">رقم القضية</h5>
 <p className="text-lg font-bold text-[var(--title-color)]">{singleCase.number}</p>
 </CustomCard>
 
 <CustomCard className="border app-border shadow-sm transition-shadow">
 <h5 className="text-sm app-text-subtle mb-2">المحكمة</h5>
 <p className="text-lg font-bold text-[var(--title-color)]">{singleCase.court}</p>
 </CustomCard>

 <CustomCard className="border app-border shadow-sm transition-shadow">
 <h5 className="text-sm app-text-subtle mb-2">نوع القضية</h5>
 <p className="text-lg font-bold text-[var(--title-color)]">{singleCase.caseTypeName}</p>
 </CustomCard>

 <CustomCard className="border app-border shadow-sm transition-shadow">
 <h5 className="text-sm app-text-subtle mb-2">اسم الموكل</h5>
 <p className="text-lg font-bold text-[var(--title-color)]">{singleCase.clientName}</p>
 </CustomCard>

 <CustomCard className="border app-border shadow-sm transition-shadow">
 <h5 className="text-sm app-text-subtle mb-2">الخصم</h5>
 <p className="text-lg font-bold text-[var(--title-color)]">{singleCase.apponentName}</p>
 </CustomCard>

 <CustomCard className="border app-border shadow-sm transition-shadow">
 <h5 className="text-sm app-text-subtle mb-2">تاريخ الإنشاء</h5>
 <p className="text-lg text-[var(--text-color)] font-medium" dir="ltr" style={{ textAlign:'right' }}>
 {creationDateFormatter.format(new Date(singleCase.creationDate)).replace(/-/g,'/')}
 </p>
 </CustomCard>
 </div>

 <CustomCard className="border app-border shadow-sm">
 <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
 <div className="flex-1 min-w-0">
 <div className="mb-4">
 <span className="text-xs font-semibold text-[var(--main-color)] bg-[var(--accent-soft)] px-2 py-1 rounded-md mb-2 inline-block border border-[var(--accent-soft-strong)]">المراجع</span>
 <h4 className="text-lg font-bold text-[var(--title-color)]">المراجع القانونية للقضية</h4>
 <p className="text-xs app-text-subtle mt-1">نوع القضية واللوائح الداخلية التي ستدخل في سياق التحليل</p>
 </div>
 <div className="flex flex-wrap gap-2">
 <span className="text-xs font-bold px-3 py-2 rounded-lg bg-[var(--accent-soft)] text-[var(--main-color)] border border-[var(--accent-soft-strong)]">
 {singleCase.caseTypeName ||'نوع القضية غير محدد'}
 </span>
 {linkedRegulations.map((regulation) => (
 <span
 key={regulation.id}
 className={`text-xs font-bold px-3 py-2 rounded-lg border ${
 regulation.isActive
 ?'bg-[var(--success-soft)] text-[var(--success-color)] border-transparent'
 :'bg-[var(--danger-soft)] text-[var(--danger-color)] border-transparent'
 }`}
 >
 {regulation.title}{regulation.isActive ?'' :' — مؤرشفة'}
 </span>
 ))}
 {linkedRegulations.length === 0 && (
 <span className="text-xs app-text-muted px-3 py-2 rounded-lg border app-border">لا توجد لوائح داخلية مرتبطة</span>
 )}
 </div>
 </div>

 <div className="w-full lg:w-[360px] flex flex-col gap-3">
 <Select
 label="تحديث اللوائح الداخلية"
 variant="bordered"
 selectionMode="multiple"
  selectedKeys={new Set(selectedRegulationIds.filter((id) => activeRegulations.some((r) => r.id === id)))}
 onSelectionChange={(keys) => {
 const next = keys ==='all'
 ? activeRegulations.map((regulation) => regulation.id)
 : Array.from(keys).map(String);
 setSelectedRegulationIds(next);
 }}
 placeholder="اختر اللوائح النشطة"
 >
 {activeRegulations.map((regulation) => (
 <SelectItem key={regulation.id} className="text-[var(--title-color)]">
 {regulation.title}
 </SelectItem>
 ))}
 </Select>
 <Button
 color="primary"
 className="text-white font-bold"
 startContent={<Save size={16} />}
 isLoading={savingReferences}
 onPress={() => void handleSaveReferences()}
 >
 حفظ المراجع
 </Button>
 </div>
 </div>
 </CustomCard>

 {/* Narratives Section */}
 <div className="grid grid-cols-1 gap-6 mt-2">
 <CustomCard className="border app-border shadow-sm">
 <div className="mb-4">
 <span className="text-xs font-semibold text-[var(--main-color)] bg-[var(--accent-soft)] px-2 py-1 rounded-md mb-2 inline-block border border-[var(--accent-soft-strong)]">ملخص</span>
 <h4 className="text-lg font-bold text-[var(--title-color)]">وصف القضية</h4>
 <p className="text-xs app-text-subtle mt-1">ملخص سريع لموضوع النزاع</p>
 </div>
 <div className="app-surface-soft p-4 rounded-lg leading-relaxed text-sm text-[var(--text-color)]">
 {singleCase.description ||'لا يوجد وصف متاح حتى الآن.'}
 </div>
 </CustomCard>

 <CustomCard className="border app-border shadow-sm">
 <div className="mb-4">
 <span className="text-xs font-semibold text-[var(--main-color)] bg-[var(--accent-soft)] px-2 py-1 rounded-md mb-2 inline-block border border-[var(--accent-soft-strong)]">الأساس</span>
 <h4 className="text-lg font-bold text-[var(--title-color)]">وقائع القضية</h4>
 <p className="text-xs app-text-subtle mt-1">سيتم الاعتماد عليها في التحليل القانوني</p>
 </div>
 <div className="app-surface-soft p-4 rounded-lg leading-loose text-sm text-[var(--text-color)] whitespace-pre-wrap">
 {singleCase.facts ||'لا توجد وقائع مسجلة حتى الآن.'}
 </div>
 </CustomCard>

 <CustomCard className="border app-border shadow-sm">
 <div className="mb-4">
 <span className="text-xs font-semibold text-[var(--main-color)] bg-[var(--accent-soft)] px-2 py-1 rounded-md mb-2 inline-block border border-[var(--accent-soft-strong)]">الطلبات</span>
 <h4 className="text-lg font-bold text-[var(--title-color)]">الطلبات القانونية</h4>
 <p className="text-xs app-text-subtle mt-1">الطلبات المطلوب تضمينها في المستند</p>
 </div>
 <div className="app-surface-soft p-4 rounded-lg leading-relaxed text-sm text-[var(--text-color)] whitespace-pre-wrap">
 {singleCase.legalClaims ||'لا توجد طلبات قانونية مسجلة حتى الآن.'}
 </div>
 </CustomCard>
 </div>
 </div>
 )
}

export default CaseDetailsComponent
