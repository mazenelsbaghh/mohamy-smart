import React, { useEffect, useMemo } from'react';
import { useForm, Controller } from'react-hook-form';
import { useDispatch, useSelector } from'react-redux';
import { useNavigate } from'react-router-dom';
import { Select, SelectItem, Textarea, Button, Input, Chip } from'@heroui/react';
import { ArrowRight, FileText, Landmark, ListChecks, Sparkles, UserRound, UsersRound } from'lucide-react';
import type { AppDispatch, RootState } from'../../redux/store';
import { fetchContractTypes, createLegalContract } from'../../redux/legalContracts/legalContractsSlice';
import thunkGetAllClients from'../../redux/clients/thunk/thunkGetAllClients';
import type { TClient, TCreateLegalContractRequest } from'../../types/types';
import { sileo } from"sileo";
import { motion } from'framer-motion';

type ContractWizardForm = TCreateLegalContractRequest & {
 customContractName?: string;
 clientRole?: string;
 counterpartyName: string;
 counterpartyRole?: string;
 counterpartyNationalId?: string;
 counterpartyAddress?: string;
 subject: string;
 assetDescription?: string;
 financialValue?: string;
 paymentTerms?: string;
 duration?: string;
 startDate?: string;
 deliveryTerms?: string;
 firstPartyObligations?: string;
 secondPartyObligations?: string;
 guarantees?: string;
 terminationTerms?: string;
 jurisdiction?: string;
 copiesCount?: string;
 notes?: string;
};

const rolePresets: Record<string, { clientRole: string; counterpartyRole: string; subjectPlaceholder: string }> = {
 lease: {
 clientRole:'مؤجر',
 counterpartyRole:'مستأجر',
 subjectPlaceholder:'إيجار شقة سكنية بالدور الثالث بالعقار رقم ...',
 },
 sale: {
 clientRole:'بائع',
 counterpartyRole:'مشتري',
 subjectPlaceholder:'بيع سيارة/عقار/منقول موصوف وصفًا نافيًا للجهالة',
 },
 employment: {
 clientRole:'صاحب عمل',
 counterpartyRole:'عامل',
 subjectPlaceholder:'تعيين موظف بوظيفة ... لدى ...',
 },
 partnership: {
 clientRole:'شريك أول',
 counterpartyRole:'شريك ثان',
 subjectPlaceholder:'تأسيس شراكة في نشاط ... بنسبة أرباح ...',
 },
 services: {
 clientRole:'مقدم خدمة',
 counterpartyRole:'متلقي خدمة',
 subjectPlaceholder:'تقديم خدمات ... وفق نطاق عمل محدد',
 },
 loan: {
 clientRole:'مقرض',
 counterpartyRole:'مقترض',
 subjectPlaceholder:'قرض نقدي بمبلغ ... مع ميعاد رد محدد',
 },
 contractor: {
 clientRole:'صاحب عمل',
 counterpartyRole:'مقاول',
 subjectPlaceholder:'تنفيذ أعمال مقاولة/تشطيبات في ...',
 },
 agency: {
 clientRole:'موكل',
 counterpartyRole:'وكيل',
 subjectPlaceholder:'منح وكالة تجارية في نطاق ...',
 },
 power_attorney: {
 clientRole:'موكل',
 counterpartyRole:'وكيل',
 subjectPlaceholder:'توكيل رسمي/خاص في التصرف أو الإدارة أو التقاضي',
 },
 other: {
 clientRole:'طرف أول',
 counterpartyRole:'طرف ثان',
 subjectPlaceholder:'اكتب محل العقد بدقة',
 },
};

const contractSections = [
 { key:'parties', title:'الأطراف', icon: UsersRound },
 { key:'subject', title:'محل العقد', icon: FileText },
 { key:'terms', title:'القيمة والمدة', icon: Landmark },
 { key:'clauses', title:'الالتزامات', icon: ListChecks },
] as const;

const nonEmpty = (value?: string | null) => (value ||'').trim();

const buildStructuredDetails = (
 values: ContractWizardForm,
 client?: TClient,
 contractTypeName?: string,
) => {
 const preset = rolePresets[values.contractTypeCode] || rolePresets.other;
 const clientRole = nonEmpty(values.clientRole) || preset.clientRole;
 const counterpartyRole = nonEmpty(values.counterpartyRole) || preset.counterpartyRole;
 const customContractName = values.contractTypeCode ==='other' ? nonEmpty(values.customContractName) : '';

 const lines = [
 'بيانات منظمة لصياغة عقد قانوني مصري:',
 '',
 '=== نوع العقد المطلوب ===',
 customContractName || contractTypeName || values.contractTypeCode,
 '',
 '=== الطرف الأول ===',
 `الاسم: ${client?.clientName ||'الموكل المسجل'}`,
 `الصفة في العقد: ${clientRole}`,
 client?.nationalId ? `الرقم القومي: ${client.nationalId}` : '',
 client?.address ? `العنوان: ${client.address}` : '',
 client?.phoneNumber ? `الهاتف: ${client.phoneNumber}` : '',
 '',
 '=== الطرف الثاني ===',
 `الاسم: ${nonEmpty(values.counterpartyName) ||'[................]'}`,
 `الصفة في العقد: ${counterpartyRole}`,
 nonEmpty(values.counterpartyNationalId) ? `الرقم القومي/السجل: ${nonEmpty(values.counterpartyNationalId)}` : '',
 nonEmpty(values.counterpartyAddress) ? `العنوان: ${nonEmpty(values.counterpartyAddress)}` : '',
 '',
 '=== محل العقد ===',
 nonEmpty(values.subject),
 nonEmpty(values.assetDescription) ? `وصف المال/العين/الخدمة: ${nonEmpty(values.assetDescription)}` : '',
 '',
 '=== المقابل والمدة ===',
 nonEmpty(values.financialValue) ? `المقابل المالي: ${nonEmpty(values.financialValue)}` : 'المقابل المالي: غير محدد، استخدم خانة تعبئة.',
 nonEmpty(values.paymentTerms) ? `طريقة ومواعيد السداد: ${nonEmpty(values.paymentTerms)}` : '',
 nonEmpty(values.duration) ? `مدة العقد: ${nonEmpty(values.duration)}` : 'مدة العقد: غير محددة، استخدم خانة تعبئة إن كانت لازمة.',
 nonEmpty(values.startDate) ? `تاريخ البداية: ${nonEmpty(values.startDate)}` : '',
 nonEmpty(values.deliveryTerms) ? `التسليم/بدء التنفيذ: ${nonEmpty(values.deliveryTerms)}` : '',
 '',
 '=== الالتزامات والبنود ===',
 nonEmpty(values.firstPartyObligations) ? `التزامات الطرف الأول: ${nonEmpty(values.firstPartyObligations)}` : '',
 nonEmpty(values.secondPartyObligations) ? `التزامات الطرف الثاني: ${nonEmpty(values.secondPartyObligations)}` : '',
 nonEmpty(values.guarantees) ? `الضمانات/الشرط الجزائي: ${nonEmpty(values.guarantees)}` : '',
 nonEmpty(values.terminationTerms) ? `الفسخ والإنهاء: ${nonEmpty(values.terminationTerms)}` : '',
 nonEmpty(values.jurisdiction) ? `المحكمة المختصة/فض النزاع: ${nonEmpty(values.jurisdiction)}` : '',
 nonEmpty(values.copiesCount) ? `عدد النسخ: ${nonEmpty(values.copiesCount)}` : '',
 nonEmpty(values.notes) ? `ملاحظات إضافية: ${nonEmpty(values.notes)}` : '',
 '',
 'تعليمات صياغة مهمة:',
 '- اعتبر المحامي محررًا للعقد وليس طرفًا فيه، إلا إذا ورد خلاف ذلك صراحة.',
 '- لا تخترع بيانات غير مذكورة، واستخدم [................] للبيانات الناقصة.',
 '- أخرج عقدًا مرتبًا ببنود مرقمة وعناوين واضحة قابلة للطباعة.',
 ];

 return lines.filter(line => line !=='').join('\n');
};

const AddNewContractsForm: React.FC = () => {
 const dispatch = useDispatch<AppDispatch>();
 const navigate = useNavigate();

 const { contractTypes, isLoadingTypes, isGenerating, error } = useSelector((state: RootState) => state.legalContracts);
 const { clients, loading } = useSelector((state: RootState) => state.clients);

 const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ContractWizardForm>({
 mode:'onChange',
 defaultValues: {
 clientId:'',
 contractTypeCode:'',
 details:'',
 customClauses:'',
 customContractName:'',
 clientRole:'',
 counterpartyName:'',
 counterpartyRole:'',
 counterpartyNationalId:'',
 counterpartyAddress:'',
 subject:'',
 assetDescription:'',
 financialValue:'',
 paymentTerms:'',
 duration:'',
 startDate:'',
 deliveryTerms:'',
 firstPartyObligations:'',
 secondPartyObligations:'',
 guarantees:'',
 terminationTerms:'',
 jurisdiction:'',
 copiesCount:'2',
 notes:'',
 }
 });

 const selectedContractType = watch('contractTypeCode');
 const selectedClientId = watch('clientId');
 const selectedClient = useMemo(
 () => clients.find((client: TClient) => client.id === selectedClientId),
 [clients, selectedClientId],
 );
 const selectedType = useMemo(
 () => contractTypes.find((type) => type.code === selectedContractType),
 [contractTypes, selectedContractType],
 );
 const preset = rolePresets[selectedContractType] || rolePresets.other;

 useEffect(() => {
 dispatch(fetchContractTypes());
 dispatch(thunkGetAllClients({ pageNumber: 1, pageSize: 100, lawyerId:'' }));
 }, [dispatch]);

 useEffect(() => {
 if (!selectedContractType) return;
 setValue('clientRole', preset.clientRole, { shouldValidate: true });
 setValue('counterpartyRole', preset.counterpartyRole, { shouldValidate: true });
 }, [preset.clientRole, preset.counterpartyRole, selectedContractType, setValue]);

 const onSubmit = async (formData: ContractWizardForm) => {
 try {
 const details = buildStructuredDetails(formData, selectedClient, selectedType?.displayNameAr);
 const dataToSubmit: TCreateLegalContractRequest = {
 clientId: formData.clientId,
 contractTypeCode: formData.contractTypeCode,
 details,
 customClauses: formData.customClauses,
 };

 const resultAction = await dispatch(createLegalContract(dataToSubmit));
 if (createLegalContract.fulfilled.match(resultAction)) {
 sileo.success({ title:'تم صياغة العقد بنجاح' });
 navigate(`/legal-contracts/${resultAction.payload.contractId}`);
 } else {
 sileo.error({ title: resultAction.payload as string ||'تعذّر صياغة العقد. أعد المحاولة.' });
 }
 } catch {
 sileo.error({ title:'تعذّر إنشاء العقد. أعد المحاولة.' });
 }
 };

 return (
 <div className="w-full px-4 py-4 sm:px-10" dir="rtl">
 <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
 <div>
 <Button
 type="button"
 variant="light"
 startContent={<ArrowRight size={18} />}
 className="mb-3 px-0 font-semibold text-[var(--main-color)]"
 onPress={() => navigate('/legal-contracts')}
 >
 رجوع للعقود
 </Button>
 <h1 className="text-2xl font-bold text-[var(--title-color)]">صياغة عقد جديد</h1>
 <p className="mt-2 max-w-2xl text-sm app-text-subtle">
 أدخل بيانات العقد كخطوات واضحة. النظام سيحوّلها إلى مدخلات منظمة ثم يصيغ عقدًا ببنود مرقمة وقابل للطباعة.
 </p>
 </div>
 <div className="flex flex-wrap gap-2">
 {contractSections.map((section, index) => {
 const Icon = section.icon;
 return (
 <Chip key={section.key} variant="flat" className="rounded-lg px-2">
 <span className="inline-flex items-center gap-2">
 <Icon size={15} />
 {index + 1}. {section.title}
 </span>
 </Chip>
 );
 })}
 </div>
 </div>

 {error && (
 <div className="mb-5 rounded-xl border border-[var(--danger-color)]/20 bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger-color)]">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr]">
 <aside className="h-fit rounded-2xl border app-border bg-white/80 p-4 shadow-sm dark:bg-zinc-900/80 dark:border-zinc-800">
 <div className="mb-4 flex items-center gap-2">
 <Sparkles size={18} className="text-[var(--main-color)]" />
 <span className="font-bold text-[var(--title-color)]">مدخلات منظمة</span>
 </div>
 <div className="space-y-3 text-sm app-text-subtle">
 <p>كل معلومة هنا بتدخل في البرومبت باسمها، فالعقد يطلع أقل عشوائية وأسهل في المراجعة.</p>
 <p>لو معلومة مش معروفة سيبها فاضية، هيظهر مكانها خانة تعبئة داخل العقد بدل ما النظام يخترعها.</p>
 </div>
 <div className="mt-5 rounded-xl bg-[var(--main-color)]/10 p-3 text-xs font-semibold text-[var(--main-color)]">
 المحامي محرر للعقد فقط، وليس طرفًا في العقد إلا لو كتبته صراحة.
 </div>
 </aside>

 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-5"
 >
 <section className="rounded-2xl border app-border bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
 <div className="mb-4 flex items-center gap-2">
 <UsersRound size={19} className="text-[var(--main-color)]" />
 <h2 className="font-bold text-[var(--title-color)]">الأطراف ونوع العقد</h2>
 </div>
 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 <Controller
 name="clientId"
 control={control}
 rules={{ required:'يرجى اختيار الموكل' }}
 render={({ field }) => (
 <Select
 label="الموكل المسجل"
 placeholder="اختر الموكل"
 selectedKeys={field.value ? [field.value] : []}
 onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
 isLoading={loading ==='pending'}
 errorMessage={errors.clientId?.message}
 isInvalid={!!errors.clientId}
 variant="bordered"
 classNames={{ trigger:'rounded-xl' }}
 >
 {clients.map((client: TClient) => (
 <SelectItem key={client.id} textValue={client.clientName}>
 {client.clientName}
 </SelectItem>
 ))}
 </Select>
 )}
 />

 <Controller
 name="contractTypeCode"
 control={control}
 rules={{ required:'يرجى اختيار نوع العقد' }}
 render={({ field }) => (
 <Select
 label="نوع العقد"
 placeholder="اختر نوع العقد"
 selectedKeys={field.value ? [field.value] : []}
 onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
 isLoading={isLoadingTypes}
 errorMessage={errors.contractTypeCode?.message}
 isInvalid={!!errors.contractTypeCode}
 variant="bordered"
 classNames={{ trigger:'rounded-xl' }}
 >
 {contractTypes.map((type) => (
 <SelectItem key={type.code} textValue={type.displayNameAr}>
 <div className="flex flex-col">
 <span>{type.displayNameAr}</span>
 <span className="text-xs app-text-subtle">{type.description}</span>
 </div>
 </SelectItem>
 ))}
 </Select>
 )}
 />

 {selectedContractType ==='other' && (
 <Controller
 name="customContractName"
 control={control}
 rules={{ required:'يرجى كتابة نوع العقد' }}
 render={({ field }) => (
 <Input
 {...field}
 label="اسم العقد المخصص"
 placeholder="مثال: اتفاقية سرية، عقد ترخيص، عقد إدارة"
 errorMessage={errors.customContractName?.message}
 isInvalid={!!errors.customContractName}
 variant="bordered"
 classNames={{ inputWrapper:'rounded-xl' }}
 />
 )}
 />
 )}

 <Controller
 name="clientRole"
 control={control}
 render={({ field }) => (
 <Input
 {...field}
 label="صفة الموكل في العقد"
 placeholder={preset.clientRole}
 variant="bordered"
 classNames={{ inputWrapper:'rounded-xl' }}
 />
 )}
 />

 <Controller
 name="counterpartyName"
 control={control}
 rules={{ required:'اسم الطرف الثاني مطلوب' }}
 render={({ field }) => (
 <Input
 {...field}
 label="اسم الطرف الثاني"
 placeholder="اسم الشخص أو الشركة"
 errorMessage={errors.counterpartyName?.message}
 isInvalid={!!errors.counterpartyName}
 variant="bordered"
 classNames={{ inputWrapper:'rounded-xl' }}
 />
 )}
 />

 <Controller
 name="counterpartyRole"
 control={control}
 render={({ field }) => (
 <Input
 {...field}
 label="صفة الطرف الثاني"
 placeholder={preset.counterpartyRole}
 variant="bordered"
 classNames={{ inputWrapper:'rounded-xl' }}
 />
 )}
 />

 <Controller
 name="counterpartyNationalId"
 control={control}
 render={({ field }) => (
 <Input
 {...field}
 label="رقم قومي/سجل الطرف الثاني"
 placeholder="اختياري"
 variant="bordered"
 classNames={{ inputWrapper:'rounded-xl' }}
 />
 )}
 />

 <Controller
 name="counterpartyAddress"
 control={control}
 render={({ field }) => (
 <Input
 {...field}
 label="عنوان الطرف الثاني"
 placeholder="اختياري"
 variant="bordered"
 classNames={{ inputWrapper:'rounded-xl' }}
 />
 )}
 />
 </div>
 </section>

 <section className="rounded-2xl border app-border bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
 <div className="mb-4 flex items-center gap-2">
 <FileText size={19} className="text-[var(--main-color)]" />
 <h2 className="font-bold text-[var(--title-color)]">محل العقد</h2>
 </div>
 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 <Controller
 name="subject"
 control={control}
 rules={{
 required:'محل العقد مطلوب',
 minLength: { value: 10, message:'اكتب وصفًا أوضح لمحل العقد' },
 }}
 render={({ field }) => (
 <Textarea
 {...field}
 label="موضوع العقد"
 placeholder={preset.subjectPlaceholder}
 minRows={3}
 errorMessage={errors.subject?.message}
 isInvalid={!!errors.subject}
 variant="bordered"
 classNames={{ inputWrapper:'rounded-xl' }}
 />
 )}
 />
 <Controller
 name="assetDescription"
 control={control}
 render={({ field }) => (
 <Textarea
 {...field}
 label="وصف العين/الخدمة/المبيع"
 placeholder="الموقع، الحدود، رقم الوحدة، مواصفات السيارة، نطاق الخدمة..."
 minRows={3}
 variant="bordered"
 classNames={{ inputWrapper:'rounded-xl' }}
 />
 )}
 />
 </div>
 </section>

 <section className="rounded-2xl border app-border bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
 <div className="mb-4 flex items-center gap-2">
 <Landmark size={19} className="text-[var(--main-color)]" />
 <h2 className="font-bold text-[var(--title-color)]">القيمة والمدة والتنفيذ</h2>
 </div>
 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 <Controller
 name="financialValue"
 control={control}
 render={({ field }) => (
 <Input {...field} label="المقابل المالي" placeholder="مثال: 5000 جنيه شهريًا / 1,200,000 جنيه" variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name="paymentTerms"
 control={control}
 render={({ field }) => (
 <Input {...field} label="طريقة السداد" placeholder="دفعة مقدمة، أقساط، تحويل بنكي..." variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name="duration"
 control={control}
 render={({ field }) => (
 <Input {...field} label="مدة العقد" placeholder="سنة، 6 أشهر، حتى إتمام العمل..." variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name="startDate"
 control={control}
 render={({ field }) => (
 <Input {...field} label="تاريخ البداية" placeholder="مثال: 2026/05/01" variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name="deliveryTerms"
 control={control}
 render={({ field }) => (
 <Textarea {...field} label="التسليم أو بدء التنفيذ" placeholder="ميعاد التسليم، حالة العين، محضر استلام، مرحلة البدء..." minRows={2} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name="copiesCount"
 control={control}
 render={({ field }) => (
 <Input {...field} label="عدد النسخ" placeholder="2" variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 </div>
 </section>

 <section className="rounded-2xl border app-border bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
 <div className="mb-4 flex items-center gap-2">
 <ListChecks size={19} className="text-[var(--main-color)]" />
 <h2 className="font-bold text-[var(--title-color)]">الالتزامات والبنود الخاصة</h2>
 </div>
 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 <Controller
 name="firstPartyObligations"
 control={control}
 render={({ field }) => (
 <Textarea {...field} label="التزامات الطرف الأول" placeholder="كل التزام في سطر مستقل إن أمكن" minRows={3} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name="secondPartyObligations"
 control={control}
 render={({ field }) => (
 <Textarea {...field} label="التزامات الطرف الثاني" placeholder="كل التزام في سطر مستقل إن أمكن" minRows={3} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name="guarantees"
 control={control}
 render={({ field }) => (
 <Textarea {...field} label="ضمانات أو شرط جزائي" placeholder="مبلغ الشرط الجزائي، ضمان العيوب، كفالة..." minRows={2} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name="terminationTerms"
 control={control}
 render={({ field }) => (
 <Textarea {...field} label="الفسخ والإنهاء" placeholder="متى يفسخ العقد، إنذار مسبق، آثار الفسخ..." minRows={2} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name="jurisdiction"
 control={control}
 render={({ field }) => (
 <Input {...field} label="المحكمة المختصة/فض النزاع" placeholder="مثال: محاكم القاهرة الجديدة" variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name="customClauses"
 control={control}
 render={({ field }) => (
 <Textarea {...field} label="بنود خاصة حرفية" placeholder="بنود تريد إدراجها بنفس معناها داخل العقد" minRows={2} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name="notes"
 control={control}
 render={({ field }) => (
 <Textarea {...field} label="ملاحظات للمحرر" placeholder="أي تنبيه مهم للصياغة أو بيانات ناقصة" minRows={2} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 </div>
 </section>

 <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t app-border bg-[var(--bg-color)]/95 px-1 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-2 text-sm app-text-subtle">
 <UserRound size={17} />
 <span>{selectedClient?.clientName ||'اختر الموكل'} {selectedType?.displayNameAr ? `، ${selectedType.displayNameAr}` :''}</span>
 </div>
 <div className="flex justify-end gap-3">
 <Button type="button" variant="flat" color="default" onPress={() => navigate('/legal-contracts')}>
 إلغاء
 </Button>
 <Button type="submit" color="primary" isLoading={isGenerating} className="font-bold" startContent={!isGenerating ? <Sparkles size={17} /> : undefined}>
 صياغة العقد الآن
 </Button>
 </div>
 </div>
 </motion.div>
 </form>
 </div>
 );
};

export default AddNewContractsForm;
