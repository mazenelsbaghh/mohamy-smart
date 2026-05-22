import { CustomButton, CustomInput } from'@mohamy/shared-ui';
import { useState, useEffect } from"react";
import { InputOtp } from"@heroui/react";


import { useForm, Controller } from"react-hook-form";
import { zodResolver } from"@hookform/resolvers/zod";
import { sileo } from"sileo";
import { HiOutlinePhone, HiOutlineLockClosed } from"react-icons/hi2";
import { FaRegEye, FaEyeSlash } from"react-icons/fa";
import { useAppDispatch, useAppSelector } from"../../hooks/reduxHooks";
import { setRecoveryPhone, resetRecoveryState } from"../../redux/auth/authSlice";
import thunkForgotPassword from"../../redux/auth/thunk/thunkForgotPassword";
import thunkVerifyOtp from"../../redux/auth/thunk/thunkVerifyOtp";
import thunkResetPassword from"../../redux/auth/thunk/thunkResetPassword";
import {
 forgotPasswordRequestSchema,
 resetPasswordSchema,
 verifyOtpSchema,
 type TForgotPasswordRequestSchema,
 type TResetPasswordSchema,
 type TVerifyOtpSchema,
} from"../../validations/forgotPasswordSchema";

const ForgotPassword = () => {
 const dispatch = useAppDispatch();
 const { loading, recoveryStep, recoveryPhone, recoveryMessage, error } = useAppSelector((s) => s.auth);
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirm, setShowConfirm] = useState(false);
 const [cooldown, setCooldown] = useState(0);

 useEffect(() => {
 if (cooldown > 0) {
 const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
 return () => clearTimeout(timer);
 }
 }, [cooldown]);

 const requestForm = useForm<TForgotPasswordRequestSchema>({
 resolver: zodResolver(forgotPasswordRequestSchema),
 defaultValues: { phoneNumber: recoveryPhone },
 });
 const verifyForm = useForm<TVerifyOtpSchema>({
 resolver: zodResolver(verifyOtpSchema),
 defaultValues: { code:'' },
 });
 const resetForm = useForm<TResetPasswordSchema>({
 resolver: zodResolver(resetPasswordSchema),
 defaultValues: { newPassword:'', confirmPassword:'' },
 });

 const onSubmitRequest = async (data: TForgotPasswordRequestSchema) => {
 dispatch(setRecoveryPhone(data.phoneNumber));
 try {
 const message = await dispatch(thunkForgotPassword(data)).unwrap();
 sileo.success({ title: message });
 setCooldown(60); // Start timer when OTP is sent
 } catch (message) {
 sileo.error({ title: message as string });
 }
 };

 const handleResend = async () => {
 const phone = requestForm.getValues('phoneNumber') || recoveryPhone;
 if (!phone) return;
 try {
 const message = await dispatch(thunkForgotPassword({ phoneNumber: phone })).unwrap();
 sileo.success({ title: message });
 setCooldown(60);
 } catch (message) {
 sileo.error({ title: message as string });
 }
 };

 const onSubmitVerify = async (data: TVerifyOtpSchema) => {
 try {
 const message = await dispatch(thunkVerifyOtp({ phoneNumber: requestForm.getValues('phoneNumber'), code: data.code })).unwrap();
 sileo.success({ title: message });
 } catch (message) {
 sileo.error({ title: message as string });
 }
 };

 const onSubmitReset = async (data: TResetPasswordSchema) => {
 try {
 const message = await dispatch(thunkResetPassword({
 phoneNumber: requestForm.getValues('phoneNumber'),
 otpCode: verifyForm.getValues('code'),
 newPassword: data.newPassword,
 })).unwrap();
 sileo.success({ title: message });
 requestForm.reset({ phoneNumber: '' });
 verifyForm.reset();
 resetForm.reset();
 } catch (message) {
 sileo.error({ title: message as string });
 }
 };

 const passwordToggle = (visible: boolean, toggle: () => void, label: string) => (
 <button
 type="button"
 onClick={toggle}
 aria-label={label}
 className="flex items-center justify-center p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--main-color)] focus-visible:rounded cursor-pointer"
 >
 {visible
 ? <FaEyeSlash className="text-lg text-default-400 pointer-events-none" />
 : <FaRegEye className="text-lg text-default-400 pointer-events-none" />
 }
 </button>
 );

 return (
    <div>
      <header className="auth-header">
        <div className="auth-welcome-title-large">
          استعادة الحساب في <span className="text-[var(--main-color)] font-extrabold">محامي سمارت</span>
        </div>
        <h1 className="auth-heading">نسيت كلمة المرور؟</h1>
        <p className="auth-subtitle">
          سنرسل لك رمز تحقق قصير إلى الموبايل لإعادة تعيين كلمة المرور.
        </p>
        {recoveryMessage && (
          <div className="auth-status-message auth-status-success">{recoveryMessage}</div>
        )}
        {error && (
          <div className="auth-status-message auth-status-error">{error}</div>
        )}
      </header>

 <form onSubmit={requestForm.handleSubmit(onSubmitRequest)}>
 <div className="auth-input-group mb-6">
 <label htmlFor="forgot-phone" className="auth-input-label">رقم الهاتف</label>
 <CustomInput
 id="forgot-phone"
 type="tel"
 placeholder="01012345678"
 isInvalid={!!requestForm.formState.errors.phoneNumber}
 errorMessage={requestForm.formState.errors.phoneNumber?.message}
 startContent={<HiOutlinePhone className="text-xl text-default-400" />}
 autoComplete="tel"
 {...requestForm.register('phoneNumber')}
 />
 </div>

 <CustomButton
 type="submit"
 text={(loading === 'pending' || requestForm.formState.isSubmitting) && recoveryStep === 'request' ? 'جارٍ الإرسال...' : 'إرسال رمز الاستعادة'}
 fullWidth
 size="lg"
 radius="md"
 isLoading={(loading === 'pending' && recoveryStep === 'request') || requestForm.formState.isSubmitting}
 isDisabled={cooldown > 0}
 />
 </form>

 {recoveryStep !=='request' && (
 <>
 <div className="auth-divider" style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
 <span>الخطوة الثانية · التحقق</span>
 <button
 type="button"
 onClick={() => {
 dispatch(resetRecoveryState());
 setCooldown(0);
 }}
 className="text-[var(--main-color)] bg-transparent border-none cursor-pointer text-xs underline hover:opacity-80 transition-opacity absolute left-0"
 >
 تعديل الرقم
 </button>
 </div>

 <form onSubmit={verifyForm.handleSubmit(onSubmitVerify)}>
 <div className="auth-otp-wrapper">
 <label htmlFor="otp-code">رمز التحقق</label>
 <Controller
 name="code"
 control={verifyForm.control}
 render={({ field, fieldState }) => (
 <div dir="ltr" style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center' }}>
 <InputOtp
 length={6}
 value={field.value}
 onValueChange={(val) => {
   field.onChange(val);
   if (val.length === 6) {
     verifyForm.handleSubmit(onSubmitVerify)();
   }
 }}
 isInvalid={!!fieldState.error}
 autoFocus
 dir="ltr"
 size="lg"
 radius="md"
 color={fieldState.error ?"danger" :"primary"}
 variant="bordered"
 />
 {fieldState.error && (
 <span className="auth-field-error">{fieldState.error.message}</span>
 )}
 </div>
 )}
 />
 </div>

 <div className="flex flex-col gap-3 mt-6">
 <CustomButton
 type="submit"
 text={(loading === 'pending' || verifyForm.formState.isSubmitting) && recoveryStep === 'verify' ? 'جارٍ التحقق...' : 'تأكيد الرمز'}
 fullWidth
 size="lg"
 radius="md"
 isLoading={(loading === 'pending' && recoveryStep === 'verify') || verifyForm.formState.isSubmitting}
 />

 <CustomButton
 type="button"
 variant="bordered"
 color="primary"
 text={cooldown > 0 ? `إعادة إرسال الرمز (${cooldown} ثانية)` :'إعادة إرسال الرمز'}
 fullWidth
 size="lg"
 radius="md"
 isDisabled={(loading === 'pending') || verifyForm.formState.isSubmitting || cooldown > 0}
 onClick={handleResend}
 />
 </div>
 </form>
 </>
 )}

 {recoveryStep ==='reset' && (
 <>
 <div className="auth-divider">الخطوة الثالثة · كلمة مرور جديدة</div>

 <form onSubmit={resetForm.handleSubmit(onSubmitReset)}>
 <div className="auth-input-group mb-4 mt-4">
 <label htmlFor="new-password" className="auth-input-label">كلمة المرور الجديدة</label>
 <CustomInput
 id="new-password"
 type={showPassword ?"text" :"password"}
 placeholder="••••••••"
 isInvalid={!!resetForm.formState.errors.newPassword}
 errorMessage={resetForm.formState.errors.newPassword?.message}
 startContent={<HiOutlineLockClosed className="text-xl text-default-400" />}
 endContent={passwordToggle(showPassword, () => setShowPassword(!showPassword),"إظهار أو إخفاء كلمة المرور")}
 autoComplete="new-password"
 {...resetForm.register('newPassword')}
 />
 </div>

 <div className="auth-input-group mb-6">
 <label htmlFor="confirm-password" className="auth-input-label">تأكيد كلمة المرور</label>
 <CustomInput
 id="confirm-password"
 type={showConfirm ?"text" :"password"}
 placeholder="••••••••"
 isInvalid={!!resetForm.formState.errors.confirmPassword}
 errorMessage={resetForm.formState.errors.confirmPassword?.message}
 startContent={<HiOutlineLockClosed className="text-xl text-default-400" />}
 endContent={passwordToggle(showConfirm, () => setShowConfirm(!showConfirm),"إظهار أو إخفاء تأكيد كلمة المرور")}
 autoComplete="new-password"
 {...resetForm.register('confirmPassword')}
 />
 </div>

 <CustomButton
 type="submit"
 text={(loading === 'pending' || resetForm.formState.isSubmitting) ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور الجديدة'}
 fullWidth
 size="lg"
 radius="md"
 isLoading={loading === 'pending' || resetForm.formState.isSubmitting}
 />
 </form>
 </>
 )}
 </div>
 );
};

export default ForgotPassword;
