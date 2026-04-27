import { CustomButton } from'@mohamy/shared-ui';
import { useState, useEffect } from"react";
import { InputOtp } from"@heroui/react";

import { zodResolver } from"@hookform/resolvers/zod";
import { useForm, Controller } from"react-hook-form";
import { Link, useNavigate, useSearchParams } from"react-router-dom";
import z from"zod";
import { sileo } from"sileo";
import { IoIosArrowForward } from"react-icons/io";
import { useAppDispatch, useAppSelector } from"../../hooks/reduxHooks";
import thunkRequestPhoneVerification from"../../redux/auth/thunk/thunkRequestPhoneVerification";
import thunkVerifyPhoneNumber from"../../redux/auth/thunk/thunkVerifyPhoneNumber";

const verifyPhoneSchema = z.object({
 code: z.string().length(6,"رمز التحقق يجب أن يتكون من 6 أرقام").regex(/^\d{6}$/,"رمز التحقق غير صالح"),
});

type TVerifyPhoneSchema = z.infer<typeof verifyPhoneSchema>;

const VerifyPhone = () => {
 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const phoneFromQuery = searchParams.get('phone') ||'';
 const { loading, pendingVerificationPhone, pendingVerificationMessage, error } = useAppSelector((s) => s.auth);
 const [cooldown, setCooldown] = useState(60);

 useEffect(() => {
 if (cooldown > 0) {
 const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
 return () => clearTimeout(timer);
 }
 }, [cooldown]);

 const phoneNumber = phoneFromQuery || pendingVerificationPhone;

 const form = useForm<TVerifyPhoneSchema>({
 resolver: zodResolver(verifyPhoneSchema),
 defaultValues: { code:'' },
 });

 const onSubmit = async (data: TVerifyPhoneSchema) => {
 if (!phoneNumber) {
 sileo.error({ title: 'رقم الهاتف غير متوفر. ارجع إلى صفحة التسجيل.' });
 return;
 }
 try {
 const message = await dispatch(thunkVerifyPhoneNumber({ phoneNumber, code: data.code })).unwrap();
 sileo.success({ title: message });
 navigate('/auth/login', { replace: true });
 } catch (message) {
 sileo.error({ title: message as string });
 }
 };

 const handleResend = async () => {
 if (!phoneNumber) {
 sileo.error({ title: 'رقم الهاتف غير متوفر. ارجع إلى صفحة التسجيل.' });
 return;
 }
 try {
 const message = await dispatch(thunkRequestPhoneVerification({ phoneNumber })).unwrap();
 sileo.success({ title: message });
 setCooldown(60);
 } catch (message) {
 sileo.error({ title: message as string });
 }
 };

 return (
 <div>
 <Link to='/auth/sign-up' className="auth-back-link">
 <IoIosArrowForward />
 <span>العودة للتسجيل</span>
 </Link>

 <header style={{ marginBottom:'2rem', textAlign:'center' }}>
 <h1 className="auth-heading">تأكيد رقم الهاتف</h1>
 <p className="auth-subtitle" style={{ marginBottom:'0.25rem' }}>
 أرسلنا رمزًا من 6 أرقام إلى رقم الموبايل المسجل.
 </p>
 {phoneNumber && (
 <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'1rem' }}>
 <div className="auth-phone-chip" dir="ltr" style={{ margin: 0 }}>{phoneNumber}</div>
 <button
 type="button"
 onClick={() => navigate('/auth/sign-up')}
 className="text-[var(--main-color)] bg-transparent border-none cursor-pointer text-sm underline hover:opacity-80 transition-opacity"
 >
 تعديل الرقم
 </button>
 </div>
 )}
 {pendingVerificationMessage && (
 <div className="auth-status-message auth-status-success">
 {pendingVerificationMessage}
 </div>
 )}
 {error && (
 <div className="auth-status-message auth-status-error">{error}</div>
 )}
 </header>

 <form onSubmit={form.handleSubmit(onSubmit)}>
 <div className="auth-otp-wrapper">
 <label htmlFor="verify-phone-code">رمز التحقق</label>
 <Controller
 name="code"
 control={form.control}
 render={({ field, fieldState }) => (
 <div dir="ltr" style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center' }}>
 <InputOtp
 length={6}
 value={field.value}
 onValueChange={(val) => {
   field.onChange(val);
   if (val.length === 6) {
     form.handleSubmit(onSubmit)();
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
 text={(loading === 'pending' || form.formState.isSubmitting) ? 'جارٍ التحقق...' : 'تأكيد الرقم'}
 fullWidth
 size="lg"
 radius="md"
 isLoading={(loading === 'pending') || form.formState.isSubmitting}
 />

 <CustomButton
 type="button"
 variant="bordered"
 color="primary"
 text={cooldown > 0 ? `إعادة إرسال الرمز (${cooldown} ثانية)` :'إعادة إرسال الرمز'}
 fullWidth
 size="lg"
 radius="md"
 isDisabled={(loading === 'pending') || form.formState.isSubmitting || cooldown > 0}
 onClick={handleResend}
 />
 </div>
 </form>

 <p className="auth-form-footer">
 لديك حساب مؤكد بالفعل؟{''}
 <Link to='/auth/login'>تسجيل الدخول</Link>
 </p>
 </div>
 );
};

export default VerifyPhone;
