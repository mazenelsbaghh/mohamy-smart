import { CustomButton, CustomInput, Container } from'@mohamy/shared-ui';
import'./Settings.css';
import { useEffect, useState } from'react';
import { Avatar } from"@heroui/react";
import HeadTitle from"../../components/public/headTitle/HeadTitle";



import { InputPassword } from'@mohamy/shared-ui';
import { useForm } from'react-hook-form';
import type { SubmitHandler } from'react-hook-form';
import { zodResolver } from'@hookform/resolvers/zod';
import { updateProfileSchema, changePasswordSchema } from'../../validations/settingsSchema';
import type { UpdateProfileFormValues, ChangePasswordFormValues } from'../../validations/settingsSchema';
import { useAppDispatch, useAppSelector } from'../../hooks/reduxHooks';
import { fetchAdminProfile } from'../../redux/settings/thunk/fetchAdminProfile';
import { updateAdminProfile } from'../../redux/settings/thunk/updateAdminProfile';
import { changeAdminPassword } from'../../redux/settings/thunk/changeAdminPassword';
import { clearSettingsError } from'../../redux/settings/settingsSlice';
import { showSuccessToast, showErrorToast } from'../../utils/toastHelpers';
import AiModelSettings from'./AiModelSettings';

const Settings = () => {
 const dispatch = useAppDispatch();
  const { profile, isProfileLoading, isPasswordLoading, error } = useAppSelector((state) => state.settings);
 const [activeTab, setActiveTab] = useState<'profile' |'password' |'aiModels'>('profile');

 const profileForm = useForm<UpdateProfileFormValues>({
 mode:'onChange',
 resolver: zodResolver(updateProfileSchema),
 defaultValues: {
 fullName:'',
 email:'',
 phoneNumber:'',
 officeName:'',
 address:'',
 },
 });

 const passwordForm = useForm<ChangePasswordFormValues>({
 mode:'onChange',
 resolver: zodResolver(changePasswordSchema),
 defaultValues: {
 currentPassword:'',
 newPassword:'',
 confirmPassword:'',
 },
 });

 useEffect(() => {
 dispatch(fetchAdminProfile());
 }, [dispatch]);

 useEffect(() => {
 if (profile) {
 profileForm.reset({
 fullName: profile.fullName ||'',
 email: profile.email ||'',
 phoneNumber: profile.phoneNumber ||'',
 officeName: profile.officeName ||'',
 address: profile.address ||'',
 });
 }
 }, [profile, profileForm]);

 useEffect(() => {
 if (error) {
 showErrorToast(error);
 dispatch(clearSettingsError());
 }
 }, [error, dispatch]);

 const onProfileSubmit: SubmitHandler<UpdateProfileFormValues> = async (data) => {
 const result = await dispatch(updateAdminProfile(data));
 if (updateAdminProfile.fulfilled.match(result)) {
 showSuccessToast('تم تحديث بيانات الملف الشخصي بنجاح');
 }
 };

 const onPasswordSubmit: SubmitHandler<ChangePasswordFormValues> = async (data) => {
 const result = await dispatch(changeAdminPassword(data));
 if (changeAdminPassword.fulfilled.match(result)) {
 showSuccessToast('تم تغيير كلمة المرور بنجاح');
 passwordForm.reset();
 }
 };

 return (
 <section className="settings">
 <Container>
 <HeadTitle title="الإعدادات" />

 <div className="flex gap-4 mb-6">
 <button
 className={`px-6 py-2 rounded-md transition-colors ${activeTab ==='profile' ?'bg-primary-500 text-white' :'app-surface-muted app-text-muted'}`}
 onClick={() => setActiveTab('profile')}
 >
 الملف الشخصي
 </button>
 <button
 className={`px-6 py-2 rounded-md transition-colors ${activeTab ==='password' ?'bg-primary-500 text-white' :'app-surface-muted app-text-muted'}`}
 onClick={() => setActiveTab('password')}
 >
 تغيير كلمة المرور
 </button>
 <button
 className={`px-6 py-2 rounded-md transition-colors ${activeTab ==='aiModels' ?'bg-primary-500 text-white' :'app-surface-muted app-text-muted'}`}
 onClick={() => setActiveTab('aiModels')}
 >
 نماذج الذكاء الاصطناعي
 </button>
 </div>

 {activeTab ==='profile' && (
 <div className="flex flex-wrap py-10">
 <div className="w-full md:w-2/12 mb-5 flex justify-center items-start">
 <Avatar
 className="w-30 h-30 text-large"
 name={profile?.fullName ||''}
 isBordered
 color='primary'
 />
 </div>

 <div className="w-full md:w-10/12 mb-5">
 <form className="flex flex-wrap" onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput
 type='text'
 label='الاسم الكامل'
 isInvalid={!!profileForm.formState.errors.fullName}
 errorMessage={profileForm.formState.errors.fullName?.message}
 {...profileForm.register('fullName')}
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput
 type='tel'
 label='رقم الهاتف'
 isInvalid={!!profileForm.formState.errors.phoneNumber}
 errorMessage={profileForm.formState.errors.phoneNumber?.message}
 {...profileForm.register('phoneNumber')}
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput
 type='email'
 label='البريد الإلكتروني'
 isInvalid={!!profileForm.formState.errors.email}
 errorMessage={profileForm.formState.errors.email?.message}
 {...profileForm.register('email')}
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput
 type='text'
 label='اسم المكتب'
 isInvalid={!!profileForm.formState.errors.officeName}
 errorMessage={profileForm.formState.errors.officeName?.message}
 {...profileForm.register('officeName')}
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput
 type='text'
 label='العنوان'
 isInvalid={!!profileForm.formState.errors.address}
 errorMessage={profileForm.formState.errors.address?.message}
 {...profileForm.register('address')}
 />
 </div>

 <div className="w-full flex justify-end mt-28">
 <CustomButton
 type='submit'
 text='حفظ المتغيرات'
 radius='md'
 size='lg'
 color="primary"
  isLoading={isProfileLoading}
  />
  </div>
  </form>
  </div>
  </div>
  )}

  {activeTab ==='password' && (
  <div className="py-10">
  <form className="flex flex-wrap max-w-2xl" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
  <div className="w-full p-4">
  <InputPassword
  label='كلمة المرور الحالية'
  placeholder='أدخل كلمة المرور الحالية'
  isInvalid={!!passwordForm.formState.errors.currentPassword}
  errorMessage={passwordForm.formState.errors.currentPassword?.message}
  {...passwordForm.register('currentPassword')}
  />
  </div>
  <div className="w-full p-4">
  <InputPassword
  label='كلمة المرور الجديدة'
  placeholder='أدخل كلمة المرور الجديدة'
  isInvalid={!!passwordForm.formState.errors.newPassword}
  errorMessage={passwordForm.formState.errors.newPassword?.message}
  {...passwordForm.register('newPassword')}
  />
  </div>
  <div className="w-full p-4">
  <InputPassword
  label='تأكيد كلمة المرور الجديدة'
  placeholder='أعد إدخال كلمة المرور الجديدة'
  isInvalid={!!passwordForm.formState.errors.confirmPassword}
  errorMessage={passwordForm.formState.errors.confirmPassword?.message}
  {...passwordForm.register('confirmPassword')}
  />
  </div>
  <div className="w-full flex justify-end mt-8 p-4">
  <CustomButton
  type='submit'
  text='تغيير كلمة المرور'
  radius='md'
  size='lg'
  color="primary"
  isLoading={isPasswordLoading}
 />
 </div>
 </form>
 </div>
 )}

 {activeTab ==='aiModels' && (
 <AiModelSettings />
 )}
 </Container>
 </section>
 );
};

export default Settings;
