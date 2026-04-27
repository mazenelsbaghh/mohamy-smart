import { useForm, type SubmitHandler } from"react-hook-form";
import { ModalFooter } from"@heroui/react";
import { CustomButton } from'@mohamy/shared-ui';
import CustomTextarea from"../ui/inputs/CustomTextarea";
import { addNewDefenseSchema, type addNewDefenseSchemaType } from"../../validations/addNewDefenseSchema";
import { zodResolver } from"@hookform/resolvers/zod";


type TAddNewDefense = {
 setAllDefensesList: React.Dispatch<React.SetStateAction<string[]>>;
 allDefensesList: string[];
 onOpenChange: () => void;
}

const AddNewDefense = ({ allDefensesList, onOpenChange, setAllDefensesList }: TAddNewDefense) => {
 const { register, handleSubmit, reset, formState: { errors } } = useForm<addNewDefenseSchemaType>({
 mode:'onChange',
 resolver: zodResolver(addNewDefenseSchema),
 });
 const onSubmit: SubmitHandler<addNewDefenseSchemaType> = (data) => {
 setAllDefensesList([...allDefensesList, data.defense])
 reset();
 onOpenChange();
 }
 return (
 <form dir="rtl" onSubmit={handleSubmit(onSubmit)}>
 <CustomTextarea
 label="إضافة دافع"
 placeholder="إضافة دافع"
 variant="flat"
 isInvalid={!!errors.defense}
 errorMessage={errors.defense?.message}
 {...register('defense')}
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
 );
};

export default AddNewDefense;