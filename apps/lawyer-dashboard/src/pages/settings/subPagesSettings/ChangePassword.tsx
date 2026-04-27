import { CustomButton } from'@mohamy/shared-ui';
import { useForm, Controller } from'react-hook-form';
import { zodResolver } from'@hookform/resolvers/zod';
import { sileo } from"sileo";

import SubTitle from'../../../components/subTitle/SubTitle';

import { InputPassword } from'@mohamy/shared-ui';
import { useAppDispatch, useAppSelector } from'../../../hooks/reduxHooks';
import { changePasswordSchema } from'../../../validations/changePasswordSchema';
import type { TChangePasswordSchema } from'../../../validations/changePasswordSchema';
import thunkChangePassword from'../../../redux/settings/thunk/thunkChangePassword';
import thunkRequestAccountOtp from'../../../redux/settings/thunk/thunkRequestAccountOtp';
import thunkVerifyAccountOtp from'../../../redux/settings/thunk/thunkVerifyAccountOtp';

import'./Settings.css';

const ChangePassword = () => {
 const dispatch = useAppDispatch();
 const { passwordLoading } = useAppSelector((state) => state.settings);

 const {
 control,
 handleSubmit,
 getValues,
 reset,
 formState: { errors },
 } = useForm<TChangePasswordSchema>({
 resolver: zodResolver(changePasswordSchema),
 defaultValues: {
 currentPassword:'',
 otpCode:'',
 newPassword:'',
 confirmPassword:'',
 },
 });

 const onSubmit = (data: TChangePasswordSchema) => {
 dispatch(thunkChangePassword(data))
 .unwrap()
 .then((msg) => {
 sileo.success({ title: msg });
 reset(); // Clear form on success
 })
 .catch((err) => {
 sileo.error({ title: err });
 });
 };

 return (
 <div>
 <SubTitle title='تغيير كلمة المرور' />
 <div className='flex justify-end px-4 mb-4 gap-3'>
 <CustomButton
 type='button'
 text='إرسال رمز التحقق'
 radius='md'
 size='md'
 color='secondary'
 onClick={() => {
 dispatch(thunkRequestAccountOtp())
 .unwrap()
 .then((msg) => sileo.success({ title: msg }))
 .catch((err) => sileo.error({ title: err }));
 }}
 />
 <CustomButton
 type='button'
 text='تأكيد الرمز'
 radius='md'
 size='md'
 color='secondary'
 onClick={() => {
 const code = getValues('otpCode');
 dispatch(thunkVerifyAccountOtp({ code }))
 .unwrap()
 .then((msg) => sileo.success({ title: msg }))
 .catch((err) => sileo.error({ title: err }));
 }}
 />
 </div>
 <form dir="rtl" className='flex flex-wrap' onSubmit={handleSubmit(onSubmit)}>
 <div className="w-full md:w-6/12 p-4">
 <Controller
 name="currentPassword"
 control={control}
 render={({ field }) => (
 <InputPassword toggleIconPlacement="start"
 {...field}
 label='كلمة المرور الحالية'
 isInvalid={!!errors.currentPassword}
 errorMessage={errors.currentPassword?.message}
 />
 )}
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <Controller
 name="otpCode"
 control={control}
 render={({ field }) => (
 <InputPassword toggleIconPlacement="start"
 {...field}
 label='رمز التحقق'
 isInvalid={!!errors.otpCode}
 errorMessage={errors.otpCode?.message}
 />
 )}
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <Controller
 name="newPassword"
 control={control}
 render={({ field }) => (
 <InputPassword toggleIconPlacement="start"
 {...field}
 label='كلمة المرور الجديدة'
 isInvalid={!!errors.newPassword}
 errorMessage={errors.newPassword?.message}
 />
 )}
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <Controller
 name="confirmPassword"
 control={control}
 render={({ field }) => (
 <InputPassword toggleIconPlacement="start"
 {...field}
 label='تأكيد كلمة المرور'
 isInvalid={!!errors.confirmPassword}
 errorMessage={errors.confirmPassword?.message}
 />
 )}
 />
 </div>
 <div className="w-full flex justify-end mt-28">
 <CustomButton
 type='submit'
 text='حفظ المتغيرات'
 radius='md'
 size='lg'
 color='primary'
 isLoading={passwordLoading ==='pending'}
 />
 </div>
 </form>
 </div>
 );
};

export default ChangePassword;
