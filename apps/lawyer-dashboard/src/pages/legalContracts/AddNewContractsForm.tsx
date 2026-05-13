import React, { useEffect, useMemo, useState } from'react';
import { useForm, Controller, useFieldArray } from'react-hook-form';
import { useDispatch, useSelector } from'react-redux';
import { useNavigate } from'react-router-dom';
import { Select, SelectItem, Textarea, Button, Input, Chip, Tooltip } from'@heroui/react';
import { ArrowRight, FileText, Landmark, ListChecks, Plus, Sparkles, Trash2, UserRound, UsersRound, Wand2 } from'lucide-react';
import type { AppDispatch, RootState } from'../../redux/store';
import { fetchContractTypes, createLegalContract } from'../../redux/legalContracts/legalContractsSlice';
import thunkGetAllClients from'../../redux/clients/thunk/thunkGetAllClients';
import type { TClient, TCreateLegalContractRequest } from'../../types/types';
import api from'../../APIs/api';
import { API_ROUTES } from'../../APIs/routes';
import { sileo } from"sileo";
import { motion } from'framer-motion';
import { parseGeneratedContractSuggestions } from'./contractSuggestionParser';

type TParty = {
 name: string;
 role: string;
 nationalId?: string;
 address?: string;
 obligations?: string;
};

type ContractWizardForm = TCreateLegalContractRequest & {
 customContractName?: string;
 clientRole?: string;
 parties: TParty[];
 subject: string;
 assetDescription?: string;
 financialValue?: string;
 paymentTerms?: string;
 duration?: string;
 startDate?: string;
 deliveryTerms?: string;
 guarantees?: string;
 terminationTerms?: string;
 jurisdiction?: string;
 copiesCount?: string;
 notes?: string;
};

const rolePresets: Record<string, { clientRole: string; counterpartyRole: string; subjectPlaceholder: string }> = {
 lease: { clientRole:'مؤجر', counterpartyRole:'مستأجر', subjectPlaceholder:'إيجار شقة سكنية بالدور الثالث بالعقار رقم ...' },
 sale: { clientRole:'بائع', counterpartyRole:'مشتري', subjectPlaceholder:'بيع سيارة/عقار/منقول موصوف وصفًا نافيًا للجهالة' },
 employment: { clientRole:'صاحب عمل', counterpartyRole:'عامل', subjectPlaceholder:'تعيين موظف بوظيفة ... لدى ...' },
 partnership: { clientRole:'شريك أول', counterpartyRole:'شريك ثان', subjectPlaceholder:'تأسيس شراكة في نشاط ... بنسبة أرباح ...' },
 services: { clientRole:'مقدم خدمة', counterpartyRole:'متلقي خدمة', subjectPlaceholder:'تقديم خدمات ... وفق نطاق عمل محدد' },
 loan: { clientRole:'مقرض', counterpartyRole:'مقترض', subjectPlaceholder:'قرض نقدي بمبلغ ... مع ميعاد رد محدد' },
 contractor: { clientRole:'صاحب عمل', counterpartyRole:'مقاول', subjectPlaceholder:'تنفيذ أعمال مقاولة/تشطيبات في ...' },
 agency: { clientRole:'موكل', counterpartyRole:'وكيل', subjectPlaceholder:'منح وكالة تجارية في نطاق ...' },
 power_attorney: { clientRole:'موكل', counterpartyRole:'وكيل', subjectPlaceholder:'توكيل رسمي/خاص في التصرف أو الإدارة أو التقاضي' },
 other: { clientRole:'طرف أول', counterpartyRole:'طرف ثان', subjectPlaceholder:'اكتب محل العقد بدقة' },
};

const contractSections = [
 { key:'parties', title:'الأطراف', icon: UsersRound },
 { key:'subject', title:'محل العقد', icon: FileText },
 { key:'terms', title:'القيمة والمدة', icon: Landmark },
 { key:'clauses', title:'الالتزامات', icon: ListChecks },
] as const;

const nonEmpty = (value?: string | null) => (value ||'').trim();

const FIELD_PROMPTS: Record<string, string> = {
 financialValue:'اقترح مقابلًا ماليًا مناسبًا (رقم بالجنيه المصري) لهذا العقد.',
 paymentTerms:'اقترح طريقة سداد مناسبة (دفعة مقدمة، أقساط، تحويل بنكي) مع تفاصيلها.',
 duration:'اقترح مدة مناسبة لهذا العقد.',
 deliveryTerms:'اقترح صياغة لبند التسليم أو بدء التنفيذ.',
 guarantees:'اقترح صياغة لبند الضمانات أو الشرط الجزائي.',
 terminationTerms:'اقترح صياغة لبند الفسخ والإنهاء (متى يفسخ، إنذار مسبق، آثار الفسخ).',
 jurisdiction:'اقترح المحكمة المختصة وآلية فض النزاع.',
 customClauses:'اقترح بنودًا خاصة إضافية مناسبة لهذا العقد، كل بند في سطر مستقل.',
 assetDescription:'اقترح وصفًا تفصيليًا للعين/الخدمة/المبيع المناسب لهذا العقد.',
 obligations:'اقترح قائمة التزامات لهذا الطرف، كل التزام في سطر مستقل.',
};

const buildStructuredDetails = (
 values: ContractWizardForm,
 client?: TClient,
 contractTypeName?: string,
) => {
 const preset = rolePresets[values.contractTypeCode] || rolePresets.other;
 const clientRole = nonEmpty(values.clientRole) || preset.clientRole;
 const customContractName = values.contractTypeCode ==='other' ? nonEmpty(values.customContractName) : '';

 const lines: string[] = [
 'بيانات منظمة لصياغة عقد قانوني مصري:',
 '',
 '=== نوع العقد المطلوب ===',
 customContractName || contractTypeName || values.contractTypeCode,
 '',
 '=== الطرف الأول (الموكل) ===',
 `الاسم: ${client?.clientName ||'الموكل المسجل'}`,
 `الصفة في العقد: ${clientRole}`,
 client?.nationalId ? `الرقم القومي: ${client.nationalId}` : '',
 client?.address ? `العنوان: ${client.address}` : '',
 client?.phoneNumber ? `الهاتف: ${client.phoneNumber}` : '',
 '',
 ];

 values.parties.forEach((p, i) => {
 lines.push(`=== الطرف ${i + 2} ===`);
 lines.push(`الاسم: ${nonEmpty(p.name) ||'[................]'}`);
 lines.push(`الصفة في العقد: ${nonEmpty(p.role) || (i === 0 ? preset.counterpartyRole :'طرف')}`);
 if (nonEmpty(p.nationalId)) lines.push(`الرقم القومي/السجل: ${nonEmpty(p.nationalId)}`);
 if (nonEmpty(p.address)) lines.push(`العنوان: ${nonEmpty(p.address)}`);
 if (nonEmpty(p.obligations)) lines.push(`الالتزامات:\n${nonEmpty(p.obligations)}`);
 lines.push('');
 });

 lines.push(
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
 );

 return lines.filter(line => line !=='').join('\n');
};

const AddNewContractsForm: React.FC = () => {
 const dispatch = useDispatch<AppDispatch>();
 const navigate = useNavigate();

 const { contractTypes, isLoadingTypes, isGenerating, error } = useSelector((state: RootState) => state.legalContracts);
 const { clients, loading } = useSelector((state: RootState) => state.clients);

 const [generatingField, setGeneratingField] = useState<string | null>(null);
 const [generatingAll, setGeneratingAll] = useState(false);

 const { control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<ContractWizardForm>({
 mode:'onChange',
 defaultValues: {
 clientId:'',
 contractTypeCode:'',
 details:'',
 customClauses:'',
 customContractName:'',
 clientRole:'',
 parties: [
 { name:'', role:'', nationalId:'', address:'', obligations:'' },
 ],
 subject:'',
 assetDescription:'',
 financialValue:'',
 paymentTerms:'',
 duration:'',
 startDate:'',
 deliveryTerms:'',
 guarantees:'',
 terminationTerms:'',
 jurisdiction:'',
 copiesCount:'2',
 notes:'',
 },
 });

 const { fields: partyFields, append: appendParty, remove: removeParty } = useFieldArray({
 control,
 name:'parties',
 });

 const selectedContractType = watch('contractTypeCode');
 const selectedClientId = watch('clientId');
 const customContractName = watch('customContractName');
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
 const current = getValues('parties.0.role');
 if (!current) setValue('parties.0.role', preset.counterpartyRole, { shouldValidate: true });
 }, [preset.clientRole, preset.counterpartyRole, selectedContractType, setValue, getValues]);

 const getContractTypeName = (): string => {
 if (selectedContractType ==='other' && customContractName) return customContractName;
 return selectedType?.displayNameAr ||'';
 };

 const callSuggest = async (prompt: string): Promise<string | null> => {
 try {
 const response = await api.post(API_ROUTES.SEND_CHAT_MESSAGE, {
 message: prompt,
 conversationId: null,
 });
 const result = response.data?.data;
 const assistant = result?.messages?.find((m: { role: string }) => m.role ==='assistant');
 return assistant?.content?.trim() || null;
 } catch {
 return null;
 }
 };

 const buildContextPrompt = (fieldKey: string, partyIndex?: number): string => {
 const v = getValues();
 const typeName = getContractTypeName();
 const allParties: { name: string; role: string }[] = [
 { name: selectedClient?.clientName ||'الموكل', role: nonEmpty(v.clientRole) || preset.clientRole },
 ...v.parties.map((p) => ({ name: nonEmpty(p.name) ||'—', role: nonEmpty(p.role) ||'—' })),
 ];
 const partiesSummary = allParties.map((p, i) => `الطرف ${i + 1}: ${p.name} (${p.role})`).join('\n');

 const fieldInstruction = partyIndex !== undefined
 ? `${FIELD_PROMPTS.obligations}\nالطرف المطلوب: ${nonEmpty(v.parties[partyIndex]?.name) ||`الطرف ${partyIndex + 2}`} (${nonEmpty(v.parties[partyIndex]?.role) ||''})`
 : FIELD_PROMPTS[fieldKey];

 return `أنت مساعد قانوني مصري. ساعدني في صياغة جزء من عقد ${typeName ||'قانوني'}.

السياق الحالي:
- محل العقد: ${nonEmpty(v.subject) ||'—'}
- المقابل المالي: ${nonEmpty(v.financialValue) ||'—'}
- المدة: ${nonEmpty(v.duration) ||'—'}
- تاريخ البداية: ${nonEmpty(v.startDate) ||'—'}
- الأطراف:
${partiesSummary}

المطلوب: ${fieldInstruction}

أعد فقط نص البند المقترح بالعربية بدون تمهيد أو شرح.`;
 };

 const handleGenerateField = async (fieldName: string, partyIndex?: number) => {
 setGeneratingField(fieldName);
 const fieldKey = partyIndex !== undefined ?'obligations' : fieldName;
 const prompt = buildContextPrompt(fieldKey, partyIndex);
 const suggestion = await callSuggest(prompt);
 if (suggestion) {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 setValue(fieldName as any, suggestion, { shouldDirty: true });
 sileo.success({ title:'تم اقتراح البند' });
 } else {
 sileo.error({ title:'تعذّر التوليد. أعد المحاولة.' });
 }
 setGeneratingField(null);
 };

 const handleGenerateAll = async () => {
 setGeneratingAll(true);
 const v = getValues();
 const typeName = getContractTypeName();
 const allParties = [
 { name: selectedClient?.clientName ||'الموكل', role: nonEmpty(v.clientRole) || preset.clientRole },
 ...v.parties.map((p) => ({ name: nonEmpty(p.name) ||'—', role: nonEmpty(p.role) ||'—' })),
 ];
 const partiesSummary = allParties.map((p, i) => `الطرف ${i + 1}: ${p.name} (${p.role})`).join('\n');

 const megaPrompt = `أنت مساعد قانوني مصري. اقترح بنود عقد ${typeName ||'قانوني'} كاملة.

السياق:
- محل العقد: ${nonEmpty(v.subject) ||'—'}
- المقابل المالي: ${nonEmpty(v.financialValue) ||'—'}
- المدة: ${nonEmpty(v.duration) ||'—'}
- تاريخ البداية: ${nonEmpty(v.startDate) ||'—'}
- الأطراف:
${partiesSummary}

أعد JSON صالح فقط بهذا الشكل:
- لا تستخدم Markdown أو \`\`\`json.
- لا تضف أي شرح قبل أو بعد JSON.
- داخل القيم النصية استخدم \\n للفصل بين السطور ولا تضع سطرًا خامًا داخل النص.
{
 "assetDescription":"...",
 "paymentTerms":"...",
 "deliveryTerms":"...",
 "guarantees":"...",
 "terminationTerms":"...",
 "jurisdiction":"...",
 "customClauses":"...",
 "clientObligations":"...التزامات الطرف الأول",
 "partyObligations":["...التزامات الطرف الثاني","...التزامات الطرف الثالث"]
}
كل التزامات في سطور منفصلة بـ \\n.`;

 const raw = await callSuggest(megaPrompt);
 if (!raw) {
 sileo.error({ title:'تعذّر التوليد التلقائي.' });
 setGeneratingAll(false);
 return;
 }

 try {
 const parsed = parseGeneratedContractSuggestions(raw);
 if (!parsed) throw new Error('Invalid generated contract suggestions');
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const fillIfEmpty = (key: any, val?: string) => {
 if (val && !getValues(key)) setValue(key, val, { shouldDirty: true });
 };
 fillIfEmpty('assetDescription', parsed.assetDescription);
 fillIfEmpty('paymentTerms', parsed.paymentTerms);
 fillIfEmpty('deliveryTerms', parsed.deliveryTerms);
 fillIfEmpty('guarantees', parsed.guarantees);
 fillIfEmpty('terminationTerms', parsed.terminationTerms);
 fillIfEmpty('jurisdiction', parsed.jurisdiction);
 fillIfEmpty('customClauses', parsed.customClauses);
 if (Array.isArray(parsed.partyObligations)) {
 parsed.partyObligations.forEach((ob: string, i: number) => {
 if (i < v.parties.length && ob && !getValues(`parties.${i}.obligations`)) {
 setValue(`parties.${i}.obligations`, ob, { shouldDirty: true });
 }
 });
 }
 sileo.success({ title:'تم اقتراح كل البنود' });
 } catch {
 sileo.error({ title:'الرد غير صالح. حاول مرة أخرى.' });
 }
 setGeneratingAll(false);
 };

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

 const GenerateBtn: React.FC<{ fieldName: string; partyIndex?: number }> = ({ fieldName, partyIndex }) => {
 const isLoading = generatingField === fieldName;
 const disabled = !selectedContractType || generatingAll || (!!generatingField && !isLoading);
 return (
 <Tooltip content="اقترح هذا البند بالذكاء الاصطناعي بناءً على باقي تفاصيل العقد">
 <Button
 type="button"
 size="sm"
 variant="flat"
 color="primary"
 isLoading={isLoading}
 isDisabled={disabled}
 onPress={() => handleGenerateField(fieldName, partyIndex)}
 startContent={!isLoading && <Sparkles size={13} />}
 className="text-xs h-7"
 >
 توليد
 </Button>
 </Tooltip>
 );
 };

 const FieldHeader: React.FC<{ label: string; fieldName: string; partyIndex?: number }> = ({ label, fieldName, partyIndex }) => (
 <div className="mb-1.5 flex items-center justify-between">
 <span className="text-xs font-semibold app-text-subtle">{label}</span>
 <GenerateBtn fieldName={fieldName} partyIndex={partyIndex} />
 </div>
 );

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
 أدخل بيانات العقد كخطوات واضحة. أي خانة فيها زرار "توليد" يقدر يقترحلك صياغتها بالذكاء الاصطناعي بناءً على باقي البيانات.
 </p>
 </div>
 <div className="flex flex-col items-end gap-3">
 <Button
 type="button"
 color="secondary"
 variant="shadow"
 isLoading={generatingAll}
 isDisabled={!selectedContractType || !!generatingField}
 onPress={handleGenerateAll}
 startContent={!generatingAll && <Wand2 size={16} />}
 >
 اقترح كل البنود تلقائيًا
 </Button>
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
 <p>لو معلومة مش معروفة سيبها فاضية، أو دوس ✨ "توليد" واتركه يقترحلك.</p>
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
 {/* Section: parties */}
 <section className="rounded-2xl border app-border bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
 <div className="mb-4 flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <UsersRound size={19} className="text-[var(--main-color)]" />
 <h2 className="font-bold text-[var(--title-color)]">الأطراف ونوع العقد</h2>
 </div>
 </div>
 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 <Controller
 name="clientId"
 control={control}
 rules={{ required:'يرجى اختيار الموكل' }}
 render={({ field }) => (
 <Select
 label="الموكل المسجل (الطرف الأول)"
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
 </div>

 {/* Dynamic parties */}
 <div className="mt-6">
 <div className="mb-3 flex items-center justify-between">
 <span className="text-sm font-semibold app-text-subtle">الأطراف الأخرى ({partyFields.length})</span>
 <Button
 type="button"
 size="sm"
 variant="flat"
 color="primary"
 startContent={<Plus size={14} />}
 onPress={() => appendParty({ name:'', role:'', nationalId:'', address:'', obligations:'' })}
 >
 إضافة طرف
 </Button>
 </div>
 <div className="space-y-4">
 {partyFields.map((pf, idx) => (
 <div key={pf.id} className="rounded-xl border app-border bg-zinc-50/50 p-4 dark:bg-zinc-800/30">
 <div className="mb-3 flex items-center justify-between">
 <span className="text-sm font-semibold">الطرف {idx + 2}</span>
 {partyFields.length > 1 && (
 <Button type="button" size="sm" variant="light" color="danger" isIconOnly onPress={() => removeParty(idx)}>
 <Trash2 size={16} />
 </Button>
 )}
 </div>
 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 <Controller
 name={`parties.${idx}.name`}
 control={control}
 rules={{ required:'الاسم مطلوب' }}
 render={({ field }) => (
 <Input
 {...field}
 label={`اسم الطرف ${idx + 2}`}
 placeholder="اسم الشخص أو الشركة"
 errorMessage={errors.parties?.[idx]?.name?.message}
 isInvalid={!!errors.parties?.[idx]?.name}
 variant="bordered"
 classNames={{ inputWrapper:'rounded-xl' }}
 />
 )}
 />
 <Controller
 name={`parties.${idx}.role`}
 control={control}
 render={({ field }) => (
 <Input {...field} label="الصفة" placeholder={preset.counterpartyRole} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name={`parties.${idx}.nationalId`}
 control={control}
 render={({ field }) => (
 <Input {...field} label="رقم قومي/سجل" placeholder="اختياري" variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <Controller
 name={`parties.${idx}.address`}
 control={control}
 render={({ field }) => (
 <Input {...field} label="العنوان" placeholder="اختياري" variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <div className="lg:col-span-2">
 <FieldHeader label={`التزامات الطرف ${idx + 2}`} fieldName={`parties.${idx}.obligations`} partyIndex={idx} />
 <Controller
 name={`parties.${idx}.obligations`}
 control={control}
 render={({ field }) => (
 <Textarea {...field} placeholder="كل التزام في سطر مستقل إن أمكن" minRows={3} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 </div>
 </div>
 </div>
 ))}
 </div>
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
 rules={{ required:'محل العقد مطلوب', minLength: { value: 10, message:'اكتب وصفًا أوضح لمحل العقد' } }}
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
 <div>
 <FieldHeader label="وصف العين/الخدمة/المبيع" fieldName="assetDescription" />
 <Controller
 name="assetDescription"
 control={control}
 render={({ field }) => (
 <Textarea
 {...field}
 placeholder="الموقع، الحدود، رقم الوحدة، مواصفات السيارة، نطاق الخدمة..."
 minRows={3}
 variant="bordered"
 classNames={{ inputWrapper:'rounded-xl' }}
 />
 )}
 />
 </div>
 </div>
 </section>

 <section className="rounded-2xl border app-border bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
 <div className="mb-4 flex items-center gap-2">
 <Landmark size={19} className="text-[var(--main-color)]" />
 <h2 className="font-bold text-[var(--title-color)]">القيمة والمدة والتنفيذ</h2>
 </div>
 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 <div>
 <FieldHeader label="المقابل المالي" fieldName="financialValue" />
 <Controller
 name="financialValue"
 control={control}
 render={({ field }) => (
 <Input {...field} placeholder="مثال: 5000 جنيه شهريًا / 1,200,000 جنيه" variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 </div>
 <div>
 <FieldHeader label="طريقة السداد" fieldName="paymentTerms" />
 <Controller
 name="paymentTerms"
 control={control}
 render={({ field }) => (
 <Input {...field} placeholder="دفعة مقدمة، أقساط، تحويل بنكي..." variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 </div>
 <div>
 <FieldHeader label="مدة العقد" fieldName="duration" />
 <Controller
 name="duration"
 control={control}
 render={({ field }) => (
 <Input {...field} placeholder="سنة، 6 أشهر، حتى إتمام العمل..." variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 </div>
 <Controller
 name="startDate"
 control={control}
 render={({ field }) => (
 <Input {...field} label="تاريخ البداية" placeholder="مثال: 2026/05/01" variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 <div>
 <FieldHeader label="التسليم أو بدء التنفيذ" fieldName="deliveryTerms" />
 <Controller
 name="deliveryTerms"
 control={control}
 render={({ field }) => (
 <Textarea {...field} placeholder="ميعاد التسليم، حالة العين، محضر استلام، مرحلة البدء..." minRows={2} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 </div>
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
 <div>
 <FieldHeader label="ضمانات أو شرط جزائي" fieldName="guarantees" />
 <Controller
 name="guarantees"
 control={control}
 render={({ field }) => (
 <Textarea {...field} placeholder="مبلغ الشرط الجزائي، ضمان العيوب، كفالة..." minRows={2} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 </div>
 <div>
 <FieldHeader label="الفسخ والإنهاء" fieldName="terminationTerms" />
 <Controller
 name="terminationTerms"
 control={control}
 render={({ field }) => (
 <Textarea {...field} placeholder="متى يفسخ العقد، إنذار مسبق، آثار الفسخ..." minRows={2} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 </div>
 <div>
 <FieldHeader label="المحكمة المختصة/فض النزاع" fieldName="jurisdiction" />
 <Controller
 name="jurisdiction"
 control={control}
 render={({ field }) => (
 <Input {...field} placeholder="مثال: محاكم القاهرة الجديدة" variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 </div>
 <div>
 <FieldHeader label="بنود خاصة حرفية" fieldName="customClauses" />
 <Controller
 name="customClauses"
 control={control}
 render={({ field }) => (
 <Textarea {...field} placeholder="بنود تريد إدراجها بنفس معناها داخل العقد" minRows={2} variant="bordered" classNames={{ inputWrapper:'rounded-xl' }} />
 )}
 />
 </div>
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
