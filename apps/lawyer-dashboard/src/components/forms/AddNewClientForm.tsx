import { CustomInput } from'@mohamy/shared-ui';
import { Textarea } from"@heroui/react";
import { useForm, type SubmitHandler } from"react-hook-form";
import { addNewClientSchema, type addNewClientType } from"../../validations/addNewClientSchema";
import { zodResolver } from"@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from"../../hooks/reduxHooks";
import thunkAddNewClient from"../../redux/clients/thunk/thunkAddNewClient";
import { sileo } from"sileo";
import thunkGetAllClients from"../../redux/clients/thunk/thunkGetAllClients";
import FormSection from"../ui/form/FormSection";
import FormFooter from"../ui/form/FormFooter";

type TPropsDate = {
 onClose: () => void;
};

const AddNewClientForm = ({ onClose }: TPropsDate) => {
 const dispatch = useAppDispatch();
 const { user } = useAppSelector((state) => state.auth);
 const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<addNewClientType>({
 mode:"onChange",
 resolver: zodResolver(addNewClientSchema),
 });

 const onSubmit: SubmitHandler<addNewClientType> = async (data) => {
 if (!user) return;
 try {
 await dispatch(thunkAddNewClient({
 clientName: data.fullName,
 phoneNumber: data.phone,
 email: data.email,
 notes: data.notes,
 address: data.address,
 nationalId: data.nationalId,
 governorate: data.governorate,
 })).unwrap();
 sileo.success({ title:"تم إضافة الموكل بنجاح" });
 dispatch(thunkGetAllClients({ pageNumber: 1, pageSize: 10, lawyerId: user.userId }));
 onClose();
 } catch {
 sileo.error({ title: 'تعذّر إضافة الموكل. تحقق من البيانات وأعد المحاولة.' });
 }
 };

 return (
 <form
 className="px-6 pb-6 pt-5 flex flex-col gap-5"
 onSubmit={handleSubmit(onSubmit)}
 dir="rtl"
 >
 <FormSection label="البيانات الشخصية">
 <CustomInput
 type="text"
 label="الاسم الكامل"
 isInvalid={!!errors.fullName}
 errorMessage={errors.fullName?.message}
 {...register("fullName")}
 />
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <CustomInput
 type="text"
 label="رقم الهاتف"
 isInvalid={!!errors.phone}
 errorMessage={errors.phone?.message}
 {...register("phone")}
 />
 <CustomInput
 type="email"
 label="البريد الإلكتروني"
 isInvalid={!!errors.email}
 errorMessage={errors.email?.message}
 {...register("email")}
 />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <CustomInput
 type="text"
 label="الرقم القومي"
 isInvalid={!!errors.nationalId}
 errorMessage={errors.nationalId?.message}
 {...register("nationalId")}
 />
 <CustomInput
 type="text"
 label="المحافظة"
 isInvalid={!!errors.governorate}
 errorMessage={errors.governorate?.message}
 {...register("governorate")}
 />
 </div>
 </FormSection>

 <FormSection label="معلومات إضافية" optional withTopDivider>
 <CustomInput
 type="text"
 label="العنوان"
 isInvalid={!!errors.address}
 errorMessage={errors.address?.message}
 {...register("address")}
 />
 <Textarea
 label="ملاحظات"
 isInvalid={!!errors.notes}
 errorMessage={errors.notes?.message}
 {...register("notes")}
 />
 </FormSection>

 <FormFooter
 onCancel={onClose}
 submitLabel="إضافة الموكل"
 isLoading={isSubmitting}
 />
 </form>
 );
};

export default AddNewClientForm;
