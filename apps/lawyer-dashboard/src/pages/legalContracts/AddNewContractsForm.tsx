import React, { useEffect } from'react';
import { useForm, Controller } from'react-hook-form';
import { useDispatch, useSelector } from'react-redux';
import { useNavigate } from'react-router-dom';
import { Select, SelectItem, Textarea, Button, Input } from'@heroui/react';
import type { AppDispatch, RootState } from'../../redux/store';
import { fetchContractTypes, createLegalContract } from'../../redux/legalContracts/legalContractsSlice';
import thunkGetAllClients from'../../redux/clients/thunk/thunkGetAllClients';
import type { TCreateLegalContractRequest } from'../../types/types';
import { sileo } from"sileo";
import { motion } from'framer-motion';

const AddNewContractsForm: React.FC = () => {
 const dispatch = useDispatch<AppDispatch>();
 const navigate = useNavigate();

 const { contractTypes, isLoadingTypes, isGenerating, error } = useSelector((state: RootState) => state.legalContracts);
 const { clients, loading } = useSelector((state: RootState) => state.clients);

 const { control, handleSubmit, watch, formState: { errors } } = useForm<TCreateLegalContractRequest & { customContractName?: string }>({
 defaultValues: {
 clientId:'',
 contractTypeCode:'',
 details:'',
 customClauses:'',
 customContractName:''
 }
 });

 const selectedContractType = watch('contractTypeCode');

 useEffect(() => {
 dispatch(fetchContractTypes());
 dispatch(thunkGetAllClients({ pageNumber: 1, pageSize: 100, lawyerId:'' })); // Fetch a reasonable number of clients for dropdown
 }, [dispatch]);

 const onSubmit = async (formData: TCreateLegalContractRequest & { customContractName?: string }) => {
 try {
 const dataToSubmit: TCreateLegalContractRequest = {
 clientId: formData.clientId,
 contractTypeCode: formData.contractTypeCode,
 details: formData.contractTypeCode ==='other' && formData.customContractName 
 ? `نوع العقد المطلوب: ${formData.customContractName}\n\n${formData.details}`
 : formData.details,
 customClauses: formData.customClauses
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
 <div className="w-full py-4 px-4 sm:px-10">
 <div className="mb-8">
 <h2 className="text-2xl font-bold text-[var(--title-color)]">صياغة عقد جديد بالذكاء الاصطناعي</h2>
 <p className="app-text-subtle dark:app-text-subtle mt-2 text-sm">
 يرجى إدخال تفاصيل العقد المطلوبة، وسيقوم المساعد الذكي بصياغة المسودة القانونية بناءً على المعطيات.
 </p>
 </div>
 
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="w-full p-6 md:p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border app-border dark:border-zinc-800"
 >

 {error && (
 <div className="mb-6 p-4 bg-[var(--danger-soft)] text-[var(--danger-color)] dark:text-[var(--danger-color)] rounded-lg text-sm">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Controller
 name="clientId"
 control={control}
 rules={{ required:'يرجى اختيار الموكل' }}
 render={({ field }) => (
 <Select
 {...field}
 label="الموكل"
 placeholder="اختر الموكل"
 isLoading={loading ==='pending'}
 errorMessage={errors.clientId?.message}
 isInvalid={!!errors.clientId}
 variant="bordered"
 >
 {clients.map((client: { id: string; clientName: string }) => (
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
 {...field}
 label="نوع العقد"
 placeholder="اختر نوع العقد"
 isLoading={isLoadingTypes}
 errorMessage={errors.contractTypeCode?.message}
 isInvalid={!!errors.contractTypeCode}
 variant="bordered"
 >
 {contractTypes.map((type: { code: string; displayNameAr: string; description: string | null }) => (
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
 </div>

 {selectedContractType ==='other' && (
 <Controller
 name="customContractName"
 control={control}
 rules={{ required:'يرجى كتابة نوع العقد' }}
 render={({ field }) => (
 <Input
 {...field}
 label="اسم العقد المخصص"
 placeholder="اكتب نوع العقد الذي تريده هنا (مثال: عقد زواج، اتفاقية سرية...)"
 errorMessage={errors.customContractName?.message}
 isInvalid={!!errors.customContractName}
 variant="bordered"
 />
 )}
 />
 )}

 <Controller
 name="details"
 control={control}
 rules={{ 
 required:'يرجى إدخال تفاصيل العقد',
 minLength: { value: 20, message:'يجب أن لا تقل التفاصيل عن 20 حرفاً' }
 }}
 render={({ field }) => (
 <Textarea
 {...field}
 label="التفاصيل الأساسية"
 placeholder="أدخل التفاصيل والظروف التي يجب أن يتضمنها العقد (المدة، القيمة المالية، الالتزامات الأساسية...)"
 minRows={4}
 errorMessage={errors.details?.message}
 isInvalid={!!errors.details}
 variant="bordered"
 />
 )}
 />

 <Controller
 name="customClauses"
 control={control}
 render={({ field }) => (
 <Textarea
 {...field}
 label="بنود أو شروط خاصة (اختياري)"
 placeholder="أضف أي شروط أو بنود إضافية ترغب في تضمينها في العقد..."
 minRows={3}
 variant="bordered"
 />
 )}
 />

 <div className="flex justify-end gap-3 pt-4 border-t app-border dark:border-zinc-800">
 <Button 
 type="button" 
 variant="flat" 
 color="default"
 onPress={() => navigate('/legal-contracts')}
 >
 إلغاء
 </Button>
 <Button 
 type="submit" 
 color="primary"
 isLoading={isGenerating}
 className="font-medium"
 >
 صياغة العقد الآن
 </Button>
 </div>
 </form>
 </motion.div>
 </div>
 );
};

export default AddNewContractsForm;
