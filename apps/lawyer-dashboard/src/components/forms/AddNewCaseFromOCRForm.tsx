import { Autocomplete, AutocompleteItem, Button, Select, SelectItem, Textarea } from"@heroui/react";
import { CustomInput } from'@mohamy/shared-ui';
import { useForm, Controller, type SubmitHandler } from"react-hook-form";
import { addNewCaseFromOCRSchema, type addNewCaseFromOCRType } from"../../validations/AddNewCaseFromOCRSchema";
import { zodResolver } from"@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from"../../hooks/reduxHooks";
import { useEffect, useState } from"react";
import { sileo } from"sileo";
import thunkAddNewCase from"../../redux/cases/thunk/thunkAddNewCase";
import thunkAddNewClient from"../../redux/clients/thunk/thunkAddNewClient";
import thunkGetAllClients from"../../redux/clients/thunk/thunkGetAllClients";
import thunkGetAllCaseType from"../../redux/caseType/thunk/thunkGetAllCaseType";
import thunkGetAllCases from"../../redux/cases/thunk/thunkGetAllCases";
import thunkGetSingleCase from"../../redux/cases/thunk/thunkGetSingleCase";
import thunkUpdateCaseFacts from"../../redux/cases/thunk/thunkUpdateCaseFacts";
import { fetchInternalRegulations } from"../../redux/internalRegulations/internalRegulationsSlice";
import { clearOcrSession } from"../../redux/ocr/ocrSlice";
import { useNavigate } from"react-router-dom";
import FormSection from"../ui/form/FormSection";
import FormFooter from"../ui/form/FormFooter";
import ConfirmReviewBanner from"../ui/form/ConfirmReviewBanner";
import { normalizeDigits } from"@mohamy/shared-utils";
import type { TClient } from"../../types/types";

type Props = {
 onClose: () => void;
};

type TClientMode ='existing' |'new';

const AddNewCaseFromOCRForm = ({ onClose }: Props) => {
 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const { user } = useAppSelector((state) => state.auth);
 const { generatedCase } = useAppSelector((state) => state.ocr);
 const { clients } = useAppSelector((state) => state.clients);
 const { caseType } = useAppSelector((state) => state.caseType);
 const { cases, loading: casesLoading } = useAppSelector((state) => state.cases);
 const { regulations: internalRegulations } = useAppSelector((state) => state.internalRegulations);

 useEffect(() => {
 if (caseType.length === 0) {
 dispatch(thunkGetAllCaseType());
 }
 }, [dispatch, caseType.length]);

 useEffect(() => {
 if (internalRegulations.length === 0) {
 dispatch(fetchInternalRegulations({ page: 1, pageSize: 200 }));
 }
 }, [dispatch, internalRegulations.length]);

 type FormStep ='case-type' |'case-select' |'defending' |'client-match' |'form' |'review';
 const [step, setStep] = useState<FormStep>('case-type');
 const [caseSearch, setCaseSearch] = useState('');
 const [selectedExistingCase, setSelectedExistingCase] = useState<(typeof cases)[0] | null>(null);
 const [similarClients, setSimilarClients] = useState<TClient[]>([]);
 const [clientMode, setClientMode] = useState<TClientMode>('new');
 const [selectedClient, setSelectedClient] = useState<TClient | null>(null);
 const [autocompleteInputValue, setAutocompleteInputValue] = useState("");
 const [noCaseNumber, setNoCaseNumber] = useState(false);
 const [noCourt, setNoCourt] = useState(false);

 const { register, handleSubmit, control, formState: { errors, isSubmitting }, setValue, watch, trigger } = useForm<addNewCaseFromOCRType>({
 mode:'onChange',
 resolver: zodResolver(addNewCaseFromOCRSchema),
 defaultValues: {
 caseTitle:"",
 caseNumber:"",
 caseTypes: [],
 court:"",
 clientName:"",
 newClientPhone:"",
 newClientEmail:"",
 newClientNationalId:"",
 newClientGovernorate:"",
 newClientAddress:"",
 newClientNotes:"",
 opponentName:"",
 defendingParty:"client",
 caseDescription:"",
 caseFacts:"",
 legalRequests:"",
 internalRegulationIds: [],
 powerOfAttorneyId:"",
 }
 });

 const watched = watch();

 useEffect(() => {
 if (user) {
 dispatch(thunkGetAllClients({ pageNumber: 1, pageSize: 200, lawyerId: user.profileId }));
 }
 }, [dispatch, user]);

 useEffect(() => {
 if (step ==='case-select' && user) {
 dispatch(thunkGetAllCases({ pageNumber: 1, pageSize: 200, lawyerId: user.profileId }));
 }
 }, [step, dispatch, user]);

 useEffect(() => {
 if (generatedCase) {
 setValue("caseTitle", generatedCase.title ||"");
 setValue("caseNumber", normalizeDigits(generatedCase.number ||""));
 const matchedIds: number[] = (generatedCase as unknown as { caseTypeIds?: number[] }).caseTypeIds ?? generatedCase.CaseTypeIds ?? [];
 if (matchedIds.length) {
 setValue("caseTypes", matchedIds.map(String));
 }
 setValue("court", generatedCase.court ||"");
 setValue("clientName", generatedCase.clientName ||"");
 setValue("opponentName", generatedCase.opponentName || generatedCase.apponentName ||"");
 setValue("caseDescription", generatedCase.description ||"");
 setValue("caseFacts", generatedCase.facts ||"");
 setValue("legalRequests", generatedCase.legalClaims ||"");
 }
 }, [generatedCase, setValue]);

 // Auto-match OCR client name against existing clients
 useEffect(() => {
 if (!generatedCase?.clientName || !clients.length || clientMode ==='existing') return;
 const ocrName = generatedCase.clientName.trim().toLowerCase();
 const match = clients.find((c) => c.clientName.trim().toLowerCase() === ocrName);
 if (match) {
 setClientMode('existing');
 setSelectedClient(match);
 setValue('clientName', match.clientName, { shouldValidate: true });
 setAutocompleteInputValue(match.clientName);
 }
 }, [generatedCase, clients, clientMode, setValue]);

 const handleClientSelect = (clientId: string | null) => {
 if (!clientId) return;
 const client = clients.find((c) => c.id === clientId);
 if (client) {
 setClientMode('existing');
 setSelectedClient(client);
 setValue('clientName', client.clientName, { shouldValidate: true });
 setAutocompleteInputValue(client.clientName);
 }
 };

 const handleNewClientMode = () => {
 setClientMode('new');
 setSelectedClient(null);
 setAutocompleteInputValue("");
 setValue('clientName','');
 setValue('newClientPhone','');
 setValue('newClientEmail','');
 setValue('newClientNationalId','');
 setValue('newClientGovernorate','');
 setValue('newClientAddress','');
 setValue('newClientNotes','');
 };

 const onSubmit: SubmitHandler<addNewCaseFromOCRType> = async (data) => {
 if (step !=='review') {
 const valid = await trigger();
 if (!valid) return;
 setStep('review');
 return;
 }

 const valid = await trigger();
 if (!valid) {
 setStep('form');
 return;
 }

 if (!user) return;

 const toastId = sileo.show({ type:"loading", title:'جاري إنشاء القضية' });
 try {
 let finalClientId ='';
 let isExisted = false;

 if (clientMode ==='existing' && selectedClient) {
 finalClientId = selectedClient.id;
 isExisted = true;
 } else if (clientMode ==='new') {
 const newClientPhone = normalizeDigits(data.newClientPhone ??'').trim();
 const hasNewClientExtraDetails = [
 data.newClientEmail,
 data.newClientNationalId,
 data.newClientGovernorate,
 data.newClientAddress,
 data.newClientNotes,
 ].some((value) => !!value?.trim());

 if (!newClientPhone && hasNewClientExtraDetails) {
 sileo.dismiss(toastId);
 sileo.error({ title:'رقم الهاتف مطلوب لحفظ بيانات الموكل الجديد' });
 return;
 }

 if (newClientPhone) {
 const newClient = await dispatch(thunkAddNewClient({
 clientName: data.clientName,
 phoneNumber: newClientPhone,
 email: data.newClientEmail || undefined,
 nationalId: data.newClientNationalId || undefined,
 governorate: data.newClientGovernorate || undefined,
 address: data.newClientAddress || undefined,
 notes: data.newClientNotes || undefined,
 })).unwrap();
 if (newClient?.id) {
 finalClientId = newClient.id;
 isExisted = true;
 }
 }
 }

 const finalData = {
 caseTitle: data.caseTitle,
  caseNumber: data.caseNumber,
 CaseTypeIds: data.caseTypes.map(Number),
 court: data.court,
 clientName: data.clientName,
 opponentName: data.opponentName ??"",
 defendingParty: data.defendingParty ||"client",
 caseDescription: data.caseDescription,
 caseFacts: data.caseFacts,
 legalRequests: data.legalRequests,
 IsExistedClient: isExisted,
 clientId: finalClientId,
 PowerOfAttorneyId: data.powerOfAttorneyId ? data.powerOfAttorneyId : undefined,
 internalRegulationIds: data.internalRegulationIds ?? [],
 };
 const newCase = await dispatch(thunkAddNewCase(finalData)).unwrap();
 sileo.success({ title:'تم إنشاء القضية بنجاح. يمكنك بدء التحليل الآن.' });
 dispatch(clearOcrSession());
 onClose();
 if (newCase && (newCase.id || newCase.Id)) {
 navigate(`/cases/${newCase.id || newCase.Id}`);
 }
 } catch (error: unknown) {
 sileo.error({ title: typeof error ==='string' ? error :'تعذّر إنشاء القضية. تحقق من البيانات وأعد المحاولة.' });
 } finally {
 sileo.dismiss(toastId);
 }
 };

 const selectedCaseTypeLabels = (watched.caseTypes ?? [])
 .map(id => caseType.find(ct => String(ct.id) === id)?.title || id);

 const primaryTypeLabel = selectedCaseTypeLabels[0] ||'';

 let clientLabel ='اسم الموكل';
 let opponentLabel ='اسم الخصم';

 if (primaryTypeLabel) {
 if (primaryTypeLabel.includes('جنائ') || primaryTypeLabel.includes('عقوبات')) {
 clientLabel ='اسم الموكل (المتهم / الشاكي)';
 opponentLabel ='اسم الخصم (المجني عليه / المشكو في حقه)';
 } else if (primaryTypeLabel.includes('إداري') || primaryTypeLabel.includes('دستور')) {
 clientLabel ='اسم الموكل (الطاعن)';
 opponentLabel ='اسم الخصم (المطعون ضده)';
 } else {
 clientLabel ='اسم الموكل (المدعي)';
 opponentLabel ='اسم الخصم (المدعى عليه)';
 }
 }

 const inputClass = { inputWrapper:"app-surface border app-border hover:border-[var(--main-color)] rounded-xl" };
 const dropdownClass = {
 popoverContent:"app-surface border app-border rounded-xl shadow-lg",
 listbox:"p-1",
 };
 const autocompleteClass = {
 base:"w-full",
 listboxWrapper:"max-min-h-[220px]",
 trigger:"app-surface border app-border hover:border-[var(--main-color)] rounded-xl",
 input:"text-[var(--title-color)]",
 selectorButton:"app-text-muted",
 ...dropdownClass,
 };
 const selectClass = {
 trigger:"app-surface border app-border hover:border-[var(--main-color)] rounded-xl",
 value:"text-[var(--title-color)]",
 ...dropdownClass,
 };

 // Defending party step — shown before the main form
 // ─── Step -2: قضية جديدة أم موجودة ───
 if (step ==='case-type') {
 return (
 <div className="px-6 pb-6 pt-5 flex flex-col gap-6" dir="rtl">
 <div className="flex flex-col gap-1">
 <p className="text-base font-bold text-[var(--title-color)]">هل هذه قضية جديدة أم موجودة؟</p>
 <p className="text-sm app-text-muted">اختر نوع الإضافة قبل المتابعة</p>
 </div>

 <div className="grid grid-cols-1 gap-3">
 <button
 type="button"
 onClick={() => setStep('defending')}
 className="w-full text-end px-5 py-4 rounded-2xl border-2 app-border hover:border-[var(--main-color)] hover:bg-[var(--accent-soft)] transition-colors"
 >
 <p className="font-bold text-sm text-[var(--title-color)]">قضية جديدة</p>
 <p className="text-xs app-text-muted mt-0.5">إنشاء ملف جديد بالكامل من بيانات الـ OCR</p>
 </button>
 <button
 type="button"
 onClick={() => setStep('case-select')}
 className="w-full text-end px-5 py-4 rounded-2xl border-2 app-border hover:border-[var(--main-color)] hover:bg-[var(--accent-soft)] transition-colors"
 >
 <p className="font-bold text-sm text-[var(--title-color)]">قضية موجودة</p>
 <p className="text-xs app-text-muted mt-0.5">إضافة الوقائع المستخرجة إلى قضية محفوظة مسبقاً</p>
 </button>
 </div>

 <div className="flex items-center justify-between pt-4 border-t app-border">
 <Button variant="light" type="button" onPress={onClose} className="app-text-muted font-medium">
 إلغاء
 </Button>
 </div>
 </div>
 );
 }

 // ─── Step -1: اختيار القضية الموجودة ───
 if (step ==='case-select') {
 const filtered = cases.filter((c) =>
 c.title?.toLowerCase().includes(caseSearch.toLowerCase()) ||
 c.number?.toLowerCase().includes(caseSearch.toLowerCase()) ||
 c.clientName?.toLowerCase().includes(caseSearch.toLowerCase())
 );
 const ocrFacts = generatedCase?.facts ||'';

 const handleConfirmExisting = async () => {
 if (!selectedExistingCase) return;
 const toastId = sileo.show({ type:"loading", title:'جاري تحديث وقائع القضية' });
 try {
 await dispatch(thunkGetSingleCase({ id: String(selectedExistingCase.id) })).unwrap();
 await dispatch(thunkUpdateCaseFacts({ caseId: String(selectedExistingCase.id), facts: ocrFacts })).unwrap();
 sileo.success({ title:'تم إضافة الوقائع بنجاح' });
 dispatch(clearOcrSession());
 onClose();
 navigate(`/cases/${selectedExistingCase.id}`);
 } catch {
 sileo.error({ title:'تعذّر تحديث وقائع القضية. أعد المحاولة.' });
 } finally {
 sileo.dismiss(toastId);
 }
 };

 return (
 <div className="px-6 pb-6 pt-5 flex flex-col gap-4" dir="rtl">
 <div className="flex flex-col gap-1">
 <p className="text-base font-bold text-[var(--title-color)]">اختر القضية</p>
 <p className="text-sm app-text-muted">سيتم إضافة الوقائع المستخرجة إليها</p>
 </div>

 <input
 type="text"
 aria-label="ابحث في القضايا"
 placeholder="ابحث بالعنوان أو الرقم أو اسم الموكل..."
 value={caseSearch}
 onChange={(e) => setCaseSearch(e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl border app-border text-sm focus:outline-none focus:border-[var(--main-color)] focus:ring-1 focus:ring-[var(--main-color)]/20 app-surface text-[var(--title-color)] transition-shadow"
 dir="rtl"
 />

 <div className="flex flex-col gap-2 max-min-h-[260px] overflow-y-auto">
 {casesLoading ==='pending' && (
 <p className="text-sm app-text-muted text-center py-4">جاري البحث عن القضايا...</p>
 )}
 {casesLoading !=='pending' && filtered.length === 0 && (
 <p className="text-sm app-text-muted text-center py-4">لا توجد قضايا محفوظة بعد.</p>
 )}
 {filtered.map((c) => (
 <button
 key={c.id}
 type="button"
 onClick={() => setSelectedExistingCase(c)}
 className={`w-full text-end px-4 py-3 rounded-xl border-2 transition-colors ${
 selectedExistingCase?.id === c.id
 ?'border-[var(--main-color)] bg-[var(--accent-soft)]'
 :'app-border hover:border-[var(--border-strong)]'
 }`}
 >
 <p className="font-semibold text-sm text-[var(--title-color)]">{c.title}</p>
 <p className="text-xs app-text-muted mt-0.5">{c.number} · {c.clientName}</p>
 </button>
 ))}
 </div>

 {selectedExistingCase && ocrFacts && (
 <div className="bg-[var(--accent-soft)] border border-[var(--main-color)] rounded-xl px-4 py-3 text-xs app-text-subtle leading-relaxed">
 <p className="font-bold text-[var(--main-color)] mb-1">الوقائع التي ستُضاف:</p>
 <p className="line-clamp-4">{ocrFacts}</p>
 </div>
 )}

 <div className="flex items-center justify-between pt-4 border-t app-border">
 <Button variant="light" type="button" onPress={() => setStep('case-type')} className="app-text-muted font-medium">
 رجوع
 </Button>
 <Button
 color="primary"
 type="button"
 isDisabled={!selectedExistingCase}
 onPress={handleConfirmExisting}
 className="text-white rounded-xl px-8"
 >
 إضافة الوقائع
 </Button>
 </div>
 </div>
 );
 }

 // ─── Step 0: من تدافع عنه ───
 if (step ==='defending') {
 const clientName = watched.clientName ||'الموكل';
 const opponentName = watched.opponentName ||'الخصم';
 const defending = watched.defendingParty;
 return (
 <div className="px-6 pb-6 pt-5 flex flex-col gap-6" dir="rtl">
 <div className="flex flex-col gap-2">
 <p className="text-base font-bold text-[var(--title-color)]">من تدافع عنه في هذه القضية؟</p>
 <p className="text-sm app-text-muted">اختر الطرف الذي تمثله قبل المتابعة</p>
 </div>

 <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="حدد الطرف الذي تمثله">
 <button
 type="button"
 role="radio" aria-checked={defending === 'client'} onClick={() => setValue('defendingParty','client')}
 className={`p-4 rounded-2xl border-2 text-center transition-colors font-bold text-sm leading-snug ${
 defending ==='client'
 ?'border-[var(--main-color)] bg-[var(--accent-soft)] text-[var(--main-color)]'
 :'app-border app-text-muted hover:border-[var(--border-strong)]'
 }`}
 >
 {clientName}
 </button>
 <button
 type="button"
 role="radio" aria-checked={defending === 'opponent'} onClick={() => setValue('defendingParty','opponent')}
 className={`p-4 rounded-2xl border-2 text-center transition-colors font-bold text-sm leading-snug ${
 defending ==='opponent'
 ?'border-[var(--main-color)] bg-[var(--accent-soft)] text-[var(--main-color)]'
 :'app-border app-text-muted hover:border-[var(--border-strong)]'
 }`}
 >
 {opponentName}
 </button>
 </div>

 <div className="flex items-center justify-between pt-4 border-t app-border">
 <Button variant="light" type="button" onPress={onClose} className="app-text-muted font-medium">
 إلغاء
 </Button>
 <Button
 color="primary"
 type="button"
 onPress={() => {
 // whoever is selected becomes the client in the form
 let finalClientName = watched.clientName;
 if (watched.defendingParty ==='opponent' && watched.opponentName) {
 const prevClient = watched.clientName;
 setValue('clientName', watched.opponentName);
 setValue('opponentName', prevClient);
 finalClientName = watched.opponentName;
 }
 // find similar clients by partial word match
 const words = (finalClientName ||'').trim().toLowerCase().split(/\s+/).filter(Boolean);
 const matches = clients.filter((c) => {
 const cn = c.clientName.trim().toLowerCase();
 return words.some((w) => cn.includes(w));
 });
 setSimilarClients(matches);
 setStep('client-match');
 }}
 className="text-white rounded-xl px-8"
 >
 متابعة
 </Button>
 </div>
 </div>
 );
 }

 // ─── Step 1: اختيار الموكل من المتشابهين ───
 if (step ==='client-match') {
 const goToForm = (mode:'existing' |'new', client?: TClient) => {
 if (mode ==='existing' && client) {
 setClientMode('existing');
 setSelectedClient(client);
 setValue('clientName', client.clientName, { shouldValidate: true });
 setAutocompleteInputValue(client.clientName);
 } else {
 setClientMode('new');
 setSelectedClient(null);
 setAutocompleteInputValue(watched.clientName ||'');
 }
 setStep('form');
 };
 return (
 <div className="px-6 pb-6 pt-5 flex flex-col gap-4" dir="rtl">
 <div className="flex flex-col gap-1">
 <p className="text-base font-bold text-[var(--title-color)]">هل الموكل موجود في قائمتك؟</p>
 <p className="text-sm app-text-muted">الأسماء المتشابهة لـ"{watched.clientName}"</p>
 </div>

 <div className="flex flex-col gap-2 max-min-h-[280px] overflow-y-auto">
 {similarClients.length === 0 && (
 <p className="text-sm app-text-muted py-2 text-center">لا توجد نتائج تطابق ما كتبته.</p>
 )}
 {similarClients.map((c) => (
 <button
 key={c.id}
 type="button"
 onClick={() => goToForm('existing', c)}
 className="w-full text-end px-4 py-3 rounded-xl border app-border hover:border-[var(--main-color)] hover:bg-[var(--accent-soft)] transition-colors text-sm font-semibold text-[var(--title-color)]"
 >
 {c.clientName}
 </button>
 ))}
 </div>

 <button
 type="button"
 onClick={() => goToForm('new')}
 className="w-full text-center px-4 py-3 rounded-xl border-2 border-dashed app-border-strong hover:border-[var(--main-color)] text-sm app-text-muted hover:text-[var(--main-color)] transition-colors"
 >
 + إضافة كموكل جديد
 </button>

 <div className="flex items-center justify-between pt-4 border-t app-border">
 <Button variant="light" type="button" onPress={() => setStep('defending')} className="app-text-muted font-medium">
 رجوع
 </Button>
 </div>
 </div>
 );
 }

 return (
 <form
 onSubmit={handleSubmit(onSubmit)}
 className="px-6 pb-6 pt-5 flex flex-col gap-5"
 dir="rtl"
 >
 {step !=='review' ? (
 <>
 {/* ─── Section 1: بيانات القضية ─── */}
 <FormSection label="بيانات القضية">
 <div className="grid grid-cols-1 gap-3">
 <CustomInput
 type="text"
 variant="bordered"
 label="عنوان القضية"
 classNames={inputClass}
 isInvalid={!!errors.caseTitle}
 errorMessage={errors.caseTitle?.message}
 {...register('caseTitle')}
 />
  <div className="flex flex-col gap-1">
  <CustomInput
  type="text"
  variant="bordered"
  label="رقم الدعوى"
  classNames={{
  ...inputClass,
  input:"text-start dir-ltr",
  }}
  dir="ltr"
  isDisabled={noCaseNumber}
  isInvalid={!!errors.caseNumber}
  errorMessage={errors.caseNumber?.message}
  {...(() => {
  const { onChange, ...rest } = register('caseNumber');
  return {
  ...rest,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.value) {
  e.target.value = normalizeDigits(String(e.target.value));
  }
  onChange(e);
  }
  };
  })()}
  />
  <button
  type="button"
  aria-label={noCaseNumber ? 'إلغاء — القضية لديها رقم دعوى' : 'القضية ليس لها رقم دعوى بعد'}
  onClick={() => {
  if (noCaseNumber) {
  setNoCaseNumber(false);
  setValue('caseNumber','');
  } else {
  setNoCaseNumber(true);
  setValue('caseNumber','بدون رقم', { shouldValidate: true });
  }
  }}
  className="text-xs font-medium text-start transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--main-color)] rounded"
  style={{ color: noCaseNumber ? 'var(--main-color)' : 'var(--muted-color)' }}
  >
  {noCaseNumber ? '✓ لا يوجد رقم دعوى بعد — اضغط لإلغاء' : 'لا يوجد رقم دعوى بعد؟'}
  </button>
  </div>
 </div>
 <div className="grid grid-cols-1 gap-3">
 <Controller
 name="caseTypes"
 control={control}
 render={({ field }) => (
 <Select
 label="نوع القضية"
 variant="bordered"
 selectionMode="multiple"
 classNames={selectClass}
 isInvalid={!!errors.caseTypes}
 errorMessage={errors.caseTypes?.message as string}
 selectedKeys={new Set(field.value ?? [])}
 onSelectionChange={(keys) => {
 field.onChange(Array.from(keys).map(String));
 }}
 >
 {caseType.map((ct) => (
 <SelectItem
 key={String(ct.id)}
 className="text-[var(--title-color)] data-[hover=true]:bg-[var(--accent-soft)] data-[selected=true]:text-[var(--main-color)]"
 >
 {ct.title}
 </SelectItem>
 ))}
 </Select>
 )}
 />
 <Controller
 name="internalRegulationIds"
 control={control}
 render={({ field }) => (
 <Select
 label="اللوائح الداخلية"
 variant="bordered"
 selectionMode="multiple"
 placeholder="اختياري — اختر اللوائح المرتبطة بالقضية"
 classNames={selectClass}
 selectedKeys={new Set(field.value ?? [])}
 onSelectionChange={(keys) => {
 field.onChange(Array.from(keys).map(String));
 }}
 >
 {internalRegulations
 .filter((regulation) => regulation.isActive)
 .map((regulation) => (
 <SelectItem
 key={regulation.id}
 className="text-[var(--title-color)] data-[hover=true]:bg-[var(--accent-soft)] data-[selected=true]:text-[var(--main-color)]"
 >
 {regulation.title}
 </SelectItem>
 ))}
 </Select>
 )}
 />
 <p className="text-xs app-text-muted">
 سيتم استخدام اللوائح المختارة مع نوع القضية في التحليل القانوني.
 </p>
  <div className="flex flex-col gap-1">
  <CustomInput
  type="text"
  variant="bordered"
  label="المحكمة"
  classNames={inputClass}
  isDisabled={noCourt}
  isInvalid={!!errors.court}
  errorMessage={errors.court?.message}
  {...register('court')}
  />
  <button
  type="button"
  aria-label={noCourt ? 'إلغاء — القضية لديها محكمة' : 'القضية ليس لها محكمة بعد'}
  onClick={() => {
  if (noCourt) {
  setNoCourt(false);
  setValue('court','');
  } else {
  setNoCourt(true);
  setValue('court','بدون محكمة', { shouldValidate: true });
  }
  }}
  className="text-xs font-medium text-start transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--main-color)] rounded"
  style={{ color: noCourt ? 'var(--main-color)' : 'var(--muted-color)' }}
  >
  {noCourt ? '✓ لا توجد محكمة بعد — اضغط لإلغاء' : 'لا توجد محكمة بعد؟'}
  </button>
  </div>
 </div>
 </FormSection>

 {/* ─── Section 2: الأطراف ─── */}
 <FormSection label="الأطراف" withTopDivider>
 <Autocomplete
 label="ابحث عن موكل موجود"
 variant="bordered"
 classNames={autocompleteClass}
 placeholder="اكتب اسم الموكل للبحث..."
 inputValue={autocompleteInputValue}
 onInputChange={(val) => {
 setAutocompleteInputValue(val);
 if (!val) {
 setClientMode('new');
 setSelectedClient(null);
 setValue('clientName','');
 }
 }}
 onSelectionChange={(key) => handleClientSelect(key as string)}
 items={Array.isArray(clients) ? clients : []}
 >
 {(client) => (
 <AutocompleteItem
 key={client.id}
 textValue={client.clientName}
 className="text-[var(--title-color)] data-[hover=true]:bg-[var(--accent-soft)] data-[selected=true]:text-[var(--main-color)]"
 >
 {client.clientName}
 </AutocompleteItem>
 )}
 </Autocomplete>

 {clientMode ==='existing' && selectedClient && (
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--main-color)] font-semibold">تم اختيار: {selectedClient.clientName}</span>
 <button type="button" aria-label="إلغاء الاختيار وإضافة موكل جديد" className="app-text-muted underline text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--main-color)] rounded" onClick={handleNewClientMode}>
 إضافة موكل جديد بدلاً من ذلك
 </button>
 </div>
 )}

 <div className="grid grid-cols-1 gap-3">
 <CustomInput
 type="text"
 variant="bordered"
 label={clientLabel}
 classNames={inputClass}
 isInvalid={!!errors.clientName}
 errorMessage={errors.clientName?.message}
 isReadOnly={clientMode ==='existing'}
 value={watched.clientName}
 {...register('clientName')}
 />
 <CustomInput
 type="text"
 variant="bordered"
 label={`${opponentLabel} (اختياري)`}
 classNames={inputClass}
 isInvalid={!!errors.opponentName}
 errorMessage={errors.opponentName?.message}
 {...register('opponentName')}
 />
 </div>

 {clientMode ==='new' && (
 <div className="border border-dashed border-[var(--main-color)] rounded-xl p-4 flex flex-col gap-3">
 <p className="text-sm font-semibold text-[var(--main-color)]">بيانات الموكل الجديد</p>

 <CustomInput
 type="tel"
 variant="bordered"
 label="رقم الهاتف"
 classNames={inputClass}
 dir="ltr"
 isInvalid={!!errors.newClientPhone}
 errorMessage={errors.newClientPhone?.message}
 {...register('newClientPhone')}
 />

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <CustomInput
 type="email"
 variant="bordered"
 label="البريد الإلكتروني"
 classNames={inputClass}
 isInvalid={!!errors.newClientEmail}
 errorMessage={errors.newClientEmail?.message}
 {...register('newClientEmail')}
 />
 <CustomInput
 type="text"
 variant="bordered"
 label="الرقم القومي"
 classNames={inputClass}
 isInvalid={!!errors.newClientNationalId}
 errorMessage={errors.newClientNationalId?.message}
 {...register('newClientNationalId')}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <CustomInput
 type="text"
 variant="bordered"
 label="المحافظة"
 classNames={inputClass}
 isInvalid={!!errors.newClientGovernorate}
 errorMessage={errors.newClientGovernorate?.message}
 {...register('newClientGovernorate')}
 />
 <CustomInput
 type="text"
 variant="bordered"
 label="العنوان"
 classNames={inputClass}
 isInvalid={!!errors.newClientAddress}
 errorMessage={errors.newClientAddress?.message}
 {...register('newClientAddress')}
 />
 </div>

 <Textarea
 variant="bordered"
 classNames={{
 inputWrapper:"app-surface border app-border hover:border-[var(--main-color)] rounded-xl",
 input:"resize-y min-h-[50px] text-sm",
 }}
 label="ملاحظات"
 isInvalid={!!errors.newClientNotes}
 errorMessage={errors.newClientNotes?.message}
 {...register('newClientNotes')}
 />
 </div>
 )}
 </FormSection>

 {/* ─── Section 3: تفاصيل القضية ─── */}
 <FormSection label="تفاصيل القضية" withTopDivider>
 <Textarea
 variant="bordered"
 classNames={{
 inputWrapper:"app-surface border app-border hover:border-[var(--main-color)] rounded-xl",
 input:"resize-y min-h-[60px] text-sm leading-relaxed",
 }}
 label="وصف القضية"
 isInvalid={!!errors.caseDescription}
 errorMessage={errors.caseDescription?.message}
 {...register('caseDescription')}
 />
 <div className="grid grid-cols-1 gap-3">
 <Textarea
 variant="bordered"
 classNames={{
 inputWrapper:"app-surface border app-border hover:border-[var(--main-color)] rounded-xl",
 input:"resize-y min-h-[70px] text-sm leading-relaxed",
 }}
 label="وقائع القضية (مفصلة)"
 placeholder="يرجى كتابة الأحداث والوقائع بتفصيل دقيق..."
 isInvalid={!!errors.caseFacts}
 errorMessage={errors.caseFacts?.message}
 {...register('caseFacts')}
 />
 <Textarea
 variant="bordered"
 classNames={{
 inputWrapper:"app-surface border app-border hover:border-[var(--main-color)] rounded-xl",
 input:"resize-y min-h-[70px] text-sm leading-relaxed",
 }}
 label="الطلبات القانونية"
 isInvalid={!!errors.legalRequests}
 errorMessage={errors.legalRequests?.message}
 {...register('legalRequests')}
 />
 </div>
 </FormSection>
 </>
 ) : (
 <ConfirmReviewBanner
 sections={[
 {
 title:'بيانات القضية',
 fields: [
 { label:'عنوان القضية', value: watched.caseTitle },
  { label:'رقم الدعوى', value: watched.caseNumber },
 { label:'نوع القضية', value: selectedCaseTypeLabels.join(' /') },
 { label:'المحكمة', value: watched.court },
 ],
 },
 {
 title:'الأطراف',
 fields: [
 { label: clientLabel, value: watched.clientName },
 { label:'نوع الموكل', value: clientMode ==='existing' ?'موكل موجود' :'موكل جديد' },
 { label: opponentLabel, value: watched.opponentName },
 ],
 },
 {
 title:'تفاصيل القضية',
 fields: [
 { label:'وصف القضية', value: watched.caseDescription, fullWidth: true },
 { label:'وقائع القضية (مفصلة)', value: watched.caseFacts, fullWidth: true },
 { label:'الطلبات القانونية', value: watched.legalRequests, fullWidth: true },
 { label:'اللوائح الداخلية', value: (watched.internalRegulationIds ?? [])
 .map(id => internalRegulations.find(regulation => regulation.id === id)?.title)
 .filter(Boolean)
 .join('، ') ||'لا توجد لوائح مرتبطة', fullWidth: true },
 ],
 },
 ]}
 />
 )}

 <FormFooter
 onCancel={step ==='review' ? () => setStep('form') : () => setStep('client-match')}
 submitLabel={step ==='review' ?"تأكيد وإنشاء القضية" :"مراجعة البيانات"}
 cancelLabel={step ==='review' ?"رجوع للتعديل" :"رجوع"}
 isLoading={isSubmitting}
 />
 </form>
 );
};

export default AddNewCaseFromOCRForm;
