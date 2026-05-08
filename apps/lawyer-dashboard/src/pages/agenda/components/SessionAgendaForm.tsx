import { Select, SelectItem, Input } from"@heroui/react";
import { useForm, Controller, type SubmitHandler } from"react-hook-form";
import { zodResolver } from"@hookform/resolvers/zod";
import { sessionSchema, type SessionFormData } from"../validations";
import {
 SESSION_TYPES,
 COURT_NAMES,
 POSTPONEMENT_REASONS,
 AGENDA_STATUS_OPTIONS,
 type AgendaItem,
} from"../../../types/agenda";
import { useAppDispatch } from"../../../hooks/reduxHooks";
import thunkCreateAgendaItem from"../../../redux/agenda/thunk/thunkCreateAgendaItem";
import thunkUpdateAgendaItem from"../../../redux/agenda/thunk/thunkUpdateAgendaItem";
import { sileo } from"sileo";
import { useState } from"react";
import FormSection from"../../../components/ui/form/FormSection";
import FormFooter from"../../../components/ui/form/FormFooter";

type Props = {
 caseId: string;
 previousSessions: AgendaItem[];
 onClose: () => void;
 defaultDate?: string;
 defaultEndDate?: string;
 initialItem?: AgendaItem | null;
};

const toDateTimeLocal = (value?: string | null) => {
 if (!value) return "";
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return "";
 const offsetMs = date.getTimezoneOffset() * 60_000;
 return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const SessionAgendaForm = ({ caseId, previousSessions, onClose, defaultDate, defaultEndDate, initialItem }: Props) => {
 const dispatch = useAppDispatch();
 const initialSession = initialItem?.type ==="Session" ? initialItem : null;
 const [showPostponement, setShowPostponement] = useState(Boolean(initialSession?.previousSessionId));

 const {
 register,
 handleSubmit,
 control,
 formState: { errors, isSubmitting },
 } = useForm<SessionFormData>({
 mode:"onChange",
 resolver: zodResolver(sessionSchema),
 defaultValues: {
 type:"Session",
 title: initialSession?.title ??"",
 status: initialSession?.status ??"Scheduled",
 date: initialSession ? toDateTimeLocal(initialSession.date) : defaultDate ||"",
 endDate: initialSession ? toDateTimeLocal(initialSession.endDate) : defaultEndDate ||"",
 sessionType: initialSession?.sessionType ??"",
 courtName: initialSession?.courtName ??"",
 previousSessionId: initialSession?.previousSessionId ?? null,
 postponementReason: initialSession?.postponementReason ?? null,
 previousDecision: initialSession?.previousDecision ?? null,
 assignedLawyerId: initialSession?.assignedLawyerId ?? null,
 },
 });

 const onSubmit: SubmitHandler<SessionFormData> = async (data) => {
 try {
 const isoDate = new Date(data.date).toISOString();
 const isoEndDate = data.endDate ? new Date(data.endDate).toISOString() : null;
 const item = { ...data, date: isoDate, endDate: isoEndDate, caseId };
 if (initialSession) {
 await dispatch(thunkUpdateAgendaItem({ id: initialSession.id, item })).unwrap();
 sileo.success({ title:"تم تعديل الجلسة بنجاح" });
 } else {
 await dispatch(thunkCreateAgendaItem({ item })).unwrap();
 sileo.success({ title:"تم إضافة الجلسة بنجاح" });
 }
 onClose();
 } catch (error) {
 sileo.error({ title: `حدث خطأ: ${error}` });
 }
 };

 const sessionOptions = previousSessions.filter((s) => s.type ==="Session" && s.id !== initialSession?.id);

 return (
 <form
 className="px-6 pb-6 pt-5 flex flex-col gap-5"
 onSubmit={handleSubmit(onSubmit)}
 dir="rtl"
 >
 <FormSection label="معلومات الجلسة">
 <Input
 label="عنوان الجلسة"
 isInvalid={!!errors.title}
 errorMessage={errors.title?.message}
 classNames={{ inputWrapper:"rounded-xl" }}
 {...register("title")}
 />
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input
 type="datetime-local"
 label="من"
 isInvalid={!!errors.date}
 errorMessage={errors.date?.message}
 classNames={{ inputWrapper:"rounded-xl" }}
 {...register("date")}
 />
 <Input
 type="datetime-local"
 label="إلى"
 isInvalid={!!errors.endDate}
 errorMessage={errors.endDate?.message}
 classNames={{ inputWrapper:"rounded-xl" }}
 {...register("endDate")}
 />
 </div>
 <Controller
 name="status"
 control={control}
 render={({ field }) => (
 <Select
 label="الحالة"
 selectedKeys={field.value ? [field.value] : []}
 onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
 isInvalid={!!errors.status}
 errorMessage={errors.status?.message}
 classNames={{ trigger:"rounded-xl" }}
 >
 {AGENDA_STATUS_OPTIONS.map((opt) => (
 <SelectItem key={opt.key}>{opt.label}</SelectItem>
 ))}
 </Select>
 )}
 />
 </FormSection>

 <FormSection label="بيانات المحكمة" withTopDivider>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Controller
 name="sessionType"
 control={control}
 render={({ field }) => (
 <Select
 label="نوع الجلسة"
 selectedKeys={field.value ? [field.value] : []}
 onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
 isInvalid={!!errors.sessionType}
 errorMessage={errors.sessionType?.message}
 classNames={{ trigger:"rounded-xl" }}
 >
 {SESSION_TYPES.map((t) => (
 <SelectItem key={t}>{t}</SelectItem>
 ))}
 </Select>
 )}
 />
 <Controller
 name="courtName"
 control={control}
 render={({ field }) => (
 <Select
 label="اسم المحكمة"
 selectedKeys={field.value ? [field.value] : []}
 onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
 isInvalid={!!errors.courtName}
 errorMessage={errors.courtName?.message}
 classNames={{ trigger:"rounded-xl" }}
 >
 {COURT_NAMES.map((c) => (
 <SelectItem key={c}>{c}</SelectItem>
 ))}
 </Select>
 )}
 />
 </div>
 </FormSection>

 <FormSection label="معلومات إضافية" optional withTopDivider>
 <div className={`grid gap-3 ${showPostponement ? "sm:grid-cols-2 grid-cols-1" : "grid-cols-1"}`}>
 <Controller
 name="previousSessionId"
 control={control}
 render={({ field }) => (
 <Select
 label="الجلسة السابقة"
 selectedKeys={field.value ? [field.value] : []}
 onSelectionChange={(keys) => {
 const val = Array.from(keys)[0] as string;
 field.onChange(val || null);
 setShowPostponement(!!val);
 }}
 classNames={{ trigger:"rounded-xl" }}
 >
 {sessionOptions.map((s) => (
 <SelectItem key={s.id}>
 {s.title} — {new Date(s.date).toLocaleDateString("ar-EG")}
 </SelectItem>
 ))}
 </Select>
 )}
 />
 <Controller
 name="previousDecision"
 control={control}
 render={({ field }) => (
 <Input
 label="قرار الجلسة السابقة"
 placeholder="مثال: تأجيل لتقديم مستندات"
 value={field.value ??""}
 onValueChange={(value) => field.onChange(value || null)}
 classNames={{ inputWrapper:"rounded-xl" }}
 />
 )}
 />
 {showPostponement && (
 <Controller
 name="postponementReason"
 control={control}
 render={({ field }) => (
 <Select
 label="سبب التأجيل"
 selectedKeys={field.value ? [field.value] : []}
 onSelectionChange={(keys) => field.onChange((Array.from(keys)[0] as string) || null)}
 isInvalid={!!errors.postponementReason}
 errorMessage={errors.postponementReason?.message}
 classNames={{ trigger:"rounded-xl" }}
 >
 {POSTPONEMENT_REASONS.map((r) => (
 <SelectItem key={r}>{r}</SelectItem>
 ))}
 </Select>
 )}
 />
 )}
 </div>
 </FormSection>

 <FormFooter
 onCancel={onClose}
 submitLabel={initialSession ?"حفظ التعديل" :"إضافة الجلسة"}
 isLoading={isSubmitting}
 />
 </form>
 );
};

export default SessionAgendaForm;
