import { Select, SelectItem, Input } from"@heroui/react";
import { useForm, Controller, type SubmitHandler } from"react-hook-form";
import { zodResolver } from"@hookform/resolvers/zod";
import { actionSchema, type ActionFormData } from"../validations";
import {
 ACTION_TYPES,
 EXECUTION_DETAILS,
 INSPECTION_DETAILS,
 AGENDA_STATUS_OPTIONS,
} from"../../../types/agenda";
import { useAppDispatch } from"../../../hooks/reduxHooks";
import thunkCreateAgendaItem from"../../../redux/agenda/thunk/thunkCreateAgendaItem";
import thunkUpdateAgendaItem from"../../../redux/agenda/thunk/thunkUpdateAgendaItem";
import type { AgendaItem } from"../../../types/agenda";
import { sileo } from"sileo";
import { useState } from"react";
import FormSection from"../../../components/ui/form/FormSection";
import FormFooter from"../../../components/ui/form/FormFooter";

type Props = {
 caseId: string;
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

const ActionAgendaForm = ({ caseId, onClose, defaultDate, defaultEndDate, initialItem }: Props) => {
 const dispatch = useAppDispatch();
 const initialAction = initialItem?.type ==="Action" ? initialItem : null;
 const [selectedActionType, setSelectedActionType] = useState<string>(initialAction?.actionType ??"");

 const {
 register,
 handleSubmit,
 control,
 formState: { errors, isSubmitting },
 } = useForm<ActionFormData>({
 mode:"onChange",
 resolver: zodResolver(actionSchema),
 defaultValues: {
 type:"Action",
 title: initialAction?.title ??"",
 status: initialAction?.status ??"Scheduled",
 date: initialAction ? toDateTimeLocal(initialAction.date) : defaultDate ||"",
 endDate: initialAction ? toDateTimeLocal(initialAction.endDate) : defaultEndDate ||"",
 actionType: initialAction?.actionType ??"Inspection",
 executionDetails: initialAction?.executionDetails ??"",
 location: initialAction?.location ?? null,
 },
 });

 const onSubmit: SubmitHandler<ActionFormData> = async (data) => {
 try {
 const isoDate = new Date(data.date).toISOString();
 const isoEndDate = data.endDate ? new Date(data.endDate).toISOString() : null;
 const item = { ...data, date: isoDate, endDate: isoEndDate, caseId };
 if (initialAction) {
 await dispatch(thunkUpdateAgendaItem({ id: initialAction.id, item })).unwrap();
 sileo.success({ title:"تم تعديل الإجراء بنجاح" });
 } else {
 await dispatch(thunkCreateAgendaItem({ item })).unwrap();
 sileo.success({ title:"تم إضافة الإجراء بنجاح" });
 }
 onClose();
 } catch (error) {
 sileo.error({ title: `حدث خطأ: ${error}` });
 }
 };

 const detailOptions =
 selectedActionType ==="Inspection" ? INSPECTION_DETAILS : EXECUTION_DETAILS;

 return (
 <form
 className="px-6 pb-6 pt-5 flex flex-col gap-5"
 onSubmit={handleSubmit(onSubmit)}
 dir="rtl"
 >
 <FormSection label="معلومات الإجراء">
 <Input
 label="عنوان الإجراء"
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

 <FormSection label="تفاصيل الإجراء" withTopDivider>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Controller
 name="actionType"
 control={control}
 render={({ field }) => (
 <Select
 label="نوع الإجراء"
 selectedKeys={field.value ? [field.value] : []}
 onSelectionChange={(keys) => {
 const val = Array.from(keys)[0] as string;
 field.onChange(val);
 setSelectedActionType(val);
 }}
 isInvalid={!!errors.actionType}
 errorMessage={errors.actionType?.message}
 classNames={{ trigger:"rounded-xl" }}
 >
 {ACTION_TYPES.map((t) => (
 <SelectItem key={t.key}>{t.label}</SelectItem>
 ))}
 </Select>
 )}
 />
 <Controller
 name="executionDetails"
 control={control}
 render={({ field }) => (
 <Select
 label="تفاصيل الإجراء"
 selectedKeys={field.value ? [field.value] : []}
 onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
 isInvalid={!!errors.executionDetails}
 errorMessage={errors.executionDetails?.message}
 classNames={{ trigger:"rounded-xl" }}
 >
 {detailOptions.map((d) => (
 <SelectItem key={d}>{d}</SelectItem>
 ))}
 </Select>
 )}
 />
 </div>
 </FormSection>

 <FormSection label="الموقع" optional withTopDivider>
 <Input
 label="الموقع"
 classNames={{ inputWrapper:"rounded-xl" }}
 {...register("location")}
 />
 </FormSection>

 <FormFooter
 onCancel={onClose}
 submitLabel={initialAction ?"حفظ التعديل" :"إضافة الإجراء"}
 isLoading={isSubmitting}
 />
 </form>
 );
};

export default ActionAgendaForm;
