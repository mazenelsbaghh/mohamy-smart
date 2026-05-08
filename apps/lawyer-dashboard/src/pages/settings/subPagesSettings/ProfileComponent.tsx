import { CustomButton, CustomInput } from'@mohamy/shared-ui';
import { useEffect, useState } from 'react';
import'./Settings.css';
import { Avatar, Button } from '@heroui/react';
import { useForm, Controller } from'react-hook-form';
import { zodResolver } from'@hookform/resolvers/zod';
import { FaUserTie } from'react-icons/fa';
import { sileo } from"sileo";
import ChangePhoneModal from './ChangePhoneModal';



import { useAppDispatch, useAppSelector } from'../../../hooks/reduxHooks';
import { profileSchema } from'../../../validations/profileSchema';
import type { TProfileSchema } from'../../../validations/profileSchema';
import thunkUpdateProfile from'../../../redux/settings/thunk/thunkUpdateProfile';
import type { TProfile } from'../../../types/types';

type TProfileComponent = {
 profile: TProfile;
}

const ProfileComponent = ({ profile }: TProfileComponent) => {
 const dispatch = useAppDispatch();
 const { updateLoading } = useAppSelector((state) => state.settings);
 const [isChangePhoneOpen, setIsChangePhoneOpen] = useState(false);

 const {
 control,
 handleSubmit,
 reset,
 formState: { errors },
 } = useForm<TProfileSchema>({
 resolver: zodResolver(profileSchema),
 defaultValues: {
 fullName: profile?.fullName ||'',
 email: profile?.email ||'',
 phoneNumber: profile?.phoneNumber ||'',
 officeName: profile?.officeName ||'',
 },
 });

 useEffect(() => {
 if (profile) {
 reset({
 fullName: profile.fullName ||'',
 email: profile.email ||'',
 phoneNumber: profile.phoneNumber ||'',
 officeName: profile.officeName ||'',
 });
 }
 }, [profile, reset]);

 const onSubmit = (data: TProfileSchema) => {
 dispatch(thunkUpdateProfile({
 fullName: data.fullName,
 email: data.email,
 phoneNumber: data.phoneNumber,
 officeName: data.officeName,
 }))
 .unwrap()
 .then(() => {
 sileo.success({ title:'تم تحديث الملف الشخصي بنجاح' });
 })
 .catch((err) => {
 sileo.error({ title: err });
 });
 };

 return (
 <div className='profile-component'>
        <div className="w-full flex flex-col md:flex-row gap-8 py-10">
          <div className="w-full md:w-auto mb-5 flex justify-center md:justify-start items-start">
            <div className="relative group">
              <Avatar
                className="w-32 h-32 bg-[var(--main-color)] text-white ring-4 ring-[var(--surface-color)] dark:ring-[#1A1A1A] relative z-10 shadow-sm"
                icon={<FaUserTie className="w-12 h-12 text-white" />}
              />
            </div>
          </div>
          <div className="w-full md:flex-1 mb-5">
            <form dir="rtl" className="flex flex-wrap gap-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="w-full md:w-6/12 md:px-4">
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      {...field}
                      type='text'
                      label='الاسم الكامل'
                      isInvalid={!!errors.fullName}
                      errorMessage={errors.fullName?.message}
                    />
                  )}
                />
              </div>
              <div className="w-full md:w-6/12 md:px-4">
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      {...field}
                      type='email'
                      label='البريد الإلكتروني'
                      isInvalid={!!errors.email}
                      errorMessage={errors.email?.message}
                    />
                  )}
                />
              </div>
              <div className="w-full md:w-6/12 md:px-4">
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      {...field}
                      type='text'
                      label='رقم الهاتف'
                      isInvalid={!!errors.phoneNumber}
                      errorMessage={errors.phoneNumber?.message}
                      isReadOnly
                      endContent={
                        <Button size="sm" variant="flat" color="primary" onPress={() => setIsChangePhoneOpen(true)}>
                          تعديل
                        </Button>
                      }
                    />
                  )}
                />
              </div>
              <div className="w-full md:w-6/12 md:px-4">
                <Controller
                  name="officeName"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      {...field}
                      type='text'
                      label='مكتب المحاماة'
                      isInvalid={!!errors.officeName}
                      errorMessage={errors.officeName?.message}
                    />
                  )}
                />
              </div>
 <div className="w-full flex justify-end mt-28">
 <div className="w-full md:w-4/12 lg:w-3/12">
 <CustomButton
 type='submit'
 text='حفظ المتغيرات'
 radius='md'
 size='lg'
 color='primary'
 isLoading={updateLoading ==='pending'}
 fullWidth
 />
 </div>
 </div>
      </form>
      <ChangePhoneModal isOpen={isChangePhoneOpen} onOpenChange={setIsChangePhoneOpen} />
    </div>
  </div>
</div>
 );
};

export default ProfileComponent;