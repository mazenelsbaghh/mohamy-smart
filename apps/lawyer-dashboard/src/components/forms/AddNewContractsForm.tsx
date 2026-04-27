import { CustomInput } from'@mohamy/shared-ui';
import { InputSelect } from'@mohamy/shared-ui';
import { Textarea } from'@heroui/react';
import { FormProvider, useForm, type SubmitHandler } from'react-hook-form';
import { addNewContractsSchema, type addNewContractsType } from'../../validations/AddNewContractsSchema';
import { zodResolver } from'@hookform/resolvers/zod';
import FormFooter from'../ui/form/FormFooter';

type TProps = {
 onClose: () => void;
};

const AddNewContractsForm = ({ onClose }: TProps) => {
 const methods = useForm<addNewContractsType>({
 mode:'onChange',
 resolver: zodResolver(addNewContractsSchema),
 });
 const { register, handleSubmit, formState: { errors, isSubmitting } } = methods;

 const onSubmit: SubmitHandler<addNewContractsType> = (data) => { void data; };

 return (
 <FormProvider {...methods}>
 <form
 className='px-6 pb-6 pt-5 flex flex-col gap-4'
 onSubmit={handleSubmit(onSubmit)}
 dir='rtl'
 >
 <CustomInput
 type='text'
 label='اسم الموكل'
 isInvalid={!!errors.contractName}
 errorMessage={errors.contractName?.message}
 {...register('contractName')}
 />
 <InputSelect
 name='contractType'
 label='نوع العقد'
 data={['عقد إيجار','عقد بيع','عقد عمل','مذكرة دعوى','لائحة دعوى','مذكرة دفاع','توكيل','اعتراض','طعن']}
 radius='md'
 />
 <Textarea
 label="ملاحظات"
 isInvalid={!!errors.notes}
 errorMessage={errors.notes?.message}
 {...register('notes')}
 />

 <FormFooter
 onCancel={onClose}
 submitLabel="إضافة العقد"
 isLoading={isSubmitting}
 />
 </form>
 </FormProvider>
 );
};

export default AddNewContractsForm;
