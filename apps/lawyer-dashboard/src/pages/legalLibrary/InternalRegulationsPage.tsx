import { Button, Input, Switch, Textarea } from'@heroui/react';
import { Container } from'@mohamy/shared-ui';
import { useEffect, useMemo, useState } from'react';
import { Archive, FileText, Pencil, Plus, RotateCcw, ScanText, Search, Trash2, Upload, X } from 'lucide-react';
import { sileo } from'sileo';
import HeadTitle from'../../components/headTitle/HeadTitle';
import usePageTitle from'../../hooks/usePageTitle';
import { useAppDispatch, useAppSelector } from'../../hooks/reduxHooks';
import {
 archiveInternalRegulation,
 createInternalRegulationFromOcr,
 createInternalRegulation,
 fetchInternalRegulations,
 restoreInternalRegulation,
 updateInternalRegulation,
} from'../../redux/internalRegulations/internalRegulationsSlice';
import type { TInternalRegulation, TCreateInternalRegulationRequest } from'../../types/types';

const emptyForm: TCreateInternalRegulationRequest = {
 title:'',
 regulationNumber:'',
 issuingAuthority:'',
 summary:'',
 content:'',
};

const dateFormatter = new Intl.DateTimeFormat('ar-EG', {
 year:'numeric',
 month:'short',
 day:'numeric',
});

const formatFileSize = (size: number) => {
 if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} ك.ب`;
 return `${(size / (1024 * 1024)).toFixed(1)} م.ب`;
};

const InternalRegulationsPage = () => {
 usePageTitle('اللوائح الداخلية');
 const dispatch = useAppDispatch();
 const { regulations, loading, saving, ocrSaving } = useAppSelector((state) => state.internalRegulations);
 const [search, setSearch] = useState('');
 const [includeArchived, setIncludeArchived] = useState(false);
 const [editing, setEditing] = useState<TInternalRegulation | null>(null);
 const [form, setForm] = useState<TCreateInternalRegulationRequest>(emptyForm);
 const [ocrFiles, setOcrFiles] = useState<File[]>([]);

 useEffect(() => {
 dispatch(fetchInternalRegulations({ search, includeArchived, page: 1, pageSize: 50 }));
 }, [dispatch, search, includeArchived]);

 const activeCount = useMemo(() => regulations.filter((item) => item.isActive).length, [regulations]);

 const resetForm = () => {
 setEditing(null);
 setForm(emptyForm);
 setOcrFiles([]);
 };

 const fillForm = (item: TInternalRegulation) => {
 setEditing(item);
 setForm({
 title: item.title,
 regulationNumber: item.regulationNumber ??'',
 issuingAuthority: item.issuingAuthority ??'',
 summary: item.summary ??'',
 content: item.content,
 });
 };

 const handleSubmit = async () => {
 if (!form.title.trim() || !form.content.trim()) {
 sileo.error({ title:'عنوان اللائحة ونصها مطلوبان' });
 return;
 }

 try {
 if (editing) {
 await dispatch(updateInternalRegulation({
 id: editing.id,
 request: {
 ...form,
 isActive: editing.isActive,
 },
 })).unwrap();
 sileo.success({ title:'تم تحديث اللائحة الداخلية' });
 } else {
 await dispatch(createInternalRegulation(form)).unwrap();
 sileo.success({ title:'تم حفظ اللائحة الداخلية' });
 }
 resetForm();
 } catch (error) {
 sileo.error({ title: typeof error ==='string' ? error :'تعذّر حفظ اللائحة الداخلية' });
 }
 };

 const handleOcrFilesChange = (files: FileList | null) => {
 if (!files || files.length === 0) return;
 setOcrFiles(Array.from(files));
 };

 const handleCreateFromOcr = async () => {
 if (editing) {
 sileo.error({ title:'ألغِ التعديل الحالي قبل إنشاء لائحة من ملف' });
 return;
 }
 if (!form.title.trim()) {
 sileo.error({ title:'اكتب عنوان اللائحة قبل استخراج النص' });
 return;
 }
 if (ocrFiles.length === 0) {
 sileo.error({ title:'ارفع ملف PDF أو صورة للائحة الداخلية' });
 return;
 }

 try {
 await dispatch(createInternalRegulationFromOcr({
 title: form.title,
 regulationNumber: form.regulationNumber,
 issuingAuthority: form.issuingAuthority,
 summary: form.summary,
 files: ocrFiles,
 })).unwrap();
 sileo.success({ title:'تم استخراج النص وحفظ اللائحة الداخلية' });
 resetForm();
 } catch (error) {
 sileo.error({ title: typeof error ==='string' ? error :'تعذّر استخراج وحفظ اللائحة الداخلية' });
 }
 };

 const handleArchiveToggle = async (item: TInternalRegulation) => {
 try {
 if (item.isActive) {
 await dispatch(archiveInternalRegulation(item.id)).unwrap();
 sileo.success({ title:'تم أرشفة اللائحة الداخلية' });
 } else {
 await dispatch(restoreInternalRegulation(item.id)).unwrap();
 sileo.success({ title:'تم استعادة اللائحة الداخلية' });
 }
 } catch (error) {
 sileo.error({ title: typeof error ==='string' ? error :'تعذّر تغيير حالة اللائحة' });
 }
 };

 return (
 <section className="pb-10" dir="rtl">
 <Container>
 <HeadTitle title="اللوائح الداخلية" />

 <div className="grid grid-cols-1 xl:grid-cols-[minmax(320px,420px)_1fr] gap-5 mt-6">
 <form
 className="app-surface border app-border rounded-xl p-5 flex flex-col gap-4 h-fit"
 onSubmit={(event) => {
 event.preventDefault();
 void handleSubmit();
 }}
 >
 <div className="flex items-start justify-between gap-3">
 <div>
 <h2 className="text-base font-bold text-[var(--title-color)]">
 {editing ?'تعديل لائحة داخلية' :'إضافة لائحة داخلية'}
 </h2>
 <p className="text-xs app-text-muted mt-1">احفظ النص القانوني لاستخدامه لاحقاً داخل القضايا</p>
 </div>
 {editing && (
 <Button isIconOnly variant="light" aria-label="إلغاء التعديل" onPress={resetForm}>
 <X size={18} />
 </Button>
 )}
 </div>

 <Input
 label="عنوان اللائحة"
 variant="bordered"
 value={form.title}
 onValueChange={(value) => setForm((current) => ({ ...current, title: value }))}
 isRequired
 />
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-3">
 <Input
 label="رقم اللائحة"
 variant="bordered"
 value={form.regulationNumber ??''}
 onValueChange={(value) => setForm((current) => ({ ...current, regulationNumber: value }))}
 />
 <Input
 label="جهة الإصدار"
 variant="bordered"
 value={form.issuingAuthority ??''}
 onValueChange={(value) => setForm((current) => ({ ...current, issuingAuthority: value }))}
 />
 </div>
 <Textarea
 label="ملخص مختصر"
 variant="bordered"
 minRows={2}
 value={form.summary ??''}
 onValueChange={(value) => setForm((current) => ({ ...current, summary: value }))}
 />
 <div className="app-surface-soft border app-border rounded-lg p-4 flex flex-col gap-3">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="text-sm font-bold text-[var(--title-color)] flex items-center gap-2">
 <ScanText size={17} />
 OCR للائحة
 </p>
 <p className="text-xs app-text-muted mt-1">PDF أو صور، وسيتم حفظ الصفحات باسم اللائحة.</p>
 </div>
 <FileText size={20} className="text-[var(--main-color)] shrink-0" />
 </div>

 <input
 id="internal-regulation-ocr-files"
 type="file"
 className="sr-only"
 accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
 multiple
 onChange={(event) => {
 handleOcrFilesChange(event.currentTarget.files);
 event.currentTarget.value ='';
 }}
 />
 <label
 htmlFor="internal-regulation-ocr-files"
 className="min-h-16 border border-dashed app-border rounded-lg px-4 py-3 flex items-center justify-center gap-2 text-sm font-bold text-[var(--title-color)] cursor-pointer hover:bg-[var(--surface-muted)] transition-colors"
 >
 <Upload size={18} />
 اختر ملف اللائحة
 </label>

 {ocrFiles.length > 0 && (
 <div className="flex flex-col gap-2">
 {ocrFiles.map((file) => (
 <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 rounded-md border app-border bg-[var(--surface-color)] px-3 py-2">
 <div className="min-w-0">
 <p className="text-xs font-bold text-[var(--title-color)] truncate">{file.name}</p>
 <p className="text-[11px] app-text-muted">{formatFileSize(file.size)}</p>
 </div>
 <Button isIconOnly size="sm" variant="light" aria-label="حذف الملف" onPress={() => setOcrFiles((current) => current.filter((item) => item !== file))}>
 <Trash2 size={15} />
 </Button>
 </div>
 ))}
 </div>
 )}

 <Button
 type="button"
 variant="flat"
 color="primary"
 className="font-bold"
 isLoading={ocrSaving}
 isDisabled={saving || ocrSaving || !!editing}
 startContent={!ocrSaving ? <ScanText size={17} /> : undefined}
 onPress={() => void handleCreateFromOcr()}
 >
 استخراج وحفظ كل الصفحات
 </Button>
 {editing && (
 <p className="text-[11px] app-text-muted">استخراج OCR ينشئ لائحة جديدة. ألغِ التعديل الحالي أولًا.</p>
 )}
 </div>
 <Textarea
 label="نص اللائحة الداخلية"
 variant="bordered"
 minRows={8}
 value={form.content}
 onValueChange={(value) => setForm((current) => ({ ...current, content: value }))}
 isRequired
 />
 <Button
 color="primary"
 type="submit"
 className="text-white font-bold"
 isLoading={saving}
 startContent={!saving ? <Plus size={18} /> : undefined}
 >
 {editing ?'حفظ التعديلات' :'حفظ اللائحة'}
 </Button>
 </form>

 <div className="flex flex-col gap-4">
 <div className="app-surface border app-border rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-center justify-between">
 <div>
 <p className="text-sm font-bold text-[var(--title-color)]">المحفوظة: {regulations.length}</p>
 <p className="text-xs app-text-muted">النشطة: {activeCount}</p>
 </div>
 <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
 <Input
 aria-label="البحث في اللوائح الداخلية"
 placeholder="ابحث بالعنوان أو رقم اللائحة..."
 value={search}
 onValueChange={setSearch}
 startContent={<Search size={16} />}
 className="sm:min-w-[280px]"
 />
 <Switch isSelected={includeArchived} onValueChange={setIncludeArchived}>
 عرض المؤرشفة
 </Switch>
 </div>
 </div>

 {loading ==='pending' && (
 <div className="app-surface border app-border rounded-xl p-6 text-center text-sm app-text-muted">
 جاري تحميل اللوائح الداخلية...
 </div>
 )}

 {loading !=='pending' && regulations.length === 0 && (
 <div className="app-surface border app-border rounded-xl p-8 text-center">
 <p className="text-base font-bold text-[var(--title-color)]">لا توجد لوائح داخلية بعد</p>
 <p className="text-sm app-text-muted mt-1">أضف أول لائحة لاستخدامها مع القضايا والتحليل القانوني.</p>
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {regulations.map((item) => (
 <article key={item.id} className="app-surface border app-border rounded-xl p-5 flex flex-col gap-4">
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <h3 className="text-base font-bold text-[var(--title-color)] break-words">{item.title}</h3>
 <span className={`text-[11px] px-2 py-1 rounded-md font-bold ${item.isActive ?'bg-[var(--success-soft)] text-[var(--success-color)]' :'bg-[var(--danger-soft)] text-[var(--danger-color)]'}`}>
 {item.isActive ?'نشطة' :'مؤرشفة'}
 </span>
 </div>
 <p className="text-xs app-text-muted mt-1">
 {item.regulationNumber ||'بدون رقم'} {item.issuingAuthority ?`· ${item.issuingAuthority}` :''}
 </p>
 </div>
 <div className="flex items-center gap-1 shrink-0">
 <Button isIconOnly variant="light" aria-label="تعديل اللائحة" onPress={() => fillForm(item)}>
 <Pencil size={17} />
 </Button>
 <Button isIconOnly variant="light" aria-label={item.isActive ?'أرشفة اللائحة' :'استعادة اللائحة'} onPress={() => void handleArchiveToggle(item)}>
 {item.isActive ? <Archive size={17} /> : <RotateCcw size={17} />}
 </Button>
 </div>
 </div>
 {item.summary && (
 <p className="text-sm app-text-muted leading-relaxed">{item.summary}</p>
 )}
 <div className="app-surface-soft border app-border rounded-lg p-3 text-sm leading-loose text-[var(--text-color)] whitespace-pre-wrap line-clamp-6">
 {item.content}
 </div>
 <p className="text-[11px] app-text-subtle">
 أضيفت في {dateFormatter.format(new Date(item.createdAtUtc))}
 </p>
 </article>
 ))}
 </div>
 </div>
 </div>
 </Container>
 </section>
 );
};

export default InternalRegulationsPage;
