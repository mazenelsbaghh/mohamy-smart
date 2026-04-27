import { addNewFactSchema, type addNewFactSchemaType } from'../../validations/addNewFactSchema';
import { useForm, type SubmitHandler } from'react-hook-form';
import { zodResolver } from'@hookform/resolvers/zod';
import CustomTextarea from'../ui/inputs/CustomTextarea';
import { ModalFooter } from'@heroui/react';
import { CustomButton } from'@mohamy/shared-ui';

type TAddNewFact = {
 setCaseFacts: React.Dispatch<React.SetStateAction<string[]>>;
 caseFacts: string[];
 onOpenChange: () => void;
}
const AddNewFact = ({ setCaseFacts, caseFacts, onOpenChange }: TAddNewFact) => {
 const { register, handleSubmit, reset, formState: { errors } } = useForm<addNewFactSchemaType>({
 mode:'onChange',
 resolver: zodResolver(addNewFactSchema),
 });

 const onSubmit: SubmitHandler<addNewFactSchemaType> = (data) => {
 setCaseFacts([...caseFacts, data.fact])
 reset();
 onOpenChange();
 }
 return (
 <form dir="rtl" onSubmit={handleSubmit(onSubmit)}>
 <CustomTextarea
 isRequired label="وقائع القضية"
 placeholder="وقائع القضية"
 variant="flat"
 isInvalid={!!errors.fact}
 errorMessage={errors.fact?.message}
 {...register('fact')}
 />

 <ModalFooter className="w-full mt-5 px-0">
 <div className='w-6/12'>
 <CustomButton
 type='reset'
 text='حذف'
 size='md'
 radius='full'
 color='danger'
 fullWidth
 />
 </div>
 <div className="w-6/12">
 <CustomButton
 type='submit'
 text='اضافة'
 size='md'
 radius='full'
 fullWidth
 />
 </div>
 </ModalFooter>
 </form>
 )
}

export default AddNewFact