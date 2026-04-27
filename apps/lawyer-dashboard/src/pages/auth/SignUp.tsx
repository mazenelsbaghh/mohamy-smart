import { CustomButton, CustomInput } from'@mohamy/shared-ui';
import { useState } from"react";
import { Link, useNavigate } from"react-router-dom";
import { Checkbox } from"@heroui/react";


import { useForm, type SubmitHandler } from"react-hook-form";
import { signupSchema, type signupSchemaType } from"../../validations/signupSchema";
import { zodResolver } from"@hookform/resolvers/zod";
import { useAppDispatch } from"../../hooks/reduxHooks";
import thunkAuthRegister from"../../redux/auth/thunk/thunkAuthRegister";
import { sileo } from"sileo";
import { HiOutlineUser, HiOutlinePhone, HiOutlineEnvelope, HiOutlineLockClosed } from"react-icons/hi2";
import { IoIosArrowForward } from"react-icons/io";
import { FaRegEye, FaEyeSlash } from"react-icons/fa";
import { EGYPT_GOVERNORATES } from'@mohamy/shared-utils';

const SignUp = () => {
 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirm, setShowConfirm] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formError, setFormError] = useState<string | null>(null);

 const { register, handleSubmit, watch, setValue, setFocus, formState: { errors } } = useForm<signupSchemaType>({
 mode:'onChange',
 resolver: zodResolver(signupSchema),
 defaultValues: {
 fullName:'',
 phoneNumber:'',
 email:'',
 password:'',
 passwordConfirmation:'',
 governorate:'',
 agreeToTerms: false,
 },
 });

 const agreeToTerms = watch('agreeToTerms');

 const onSubmit: SubmitHandler<signupSchemaType> = async (data) => {
 setIsSubmitting(true);
 setFormError(null);
 await dispatch(thunkAuthRegister(data)).unwrap()
 .then((result) => {
 sileo.success({ title: result.message });
 navigate(`/auth/verify-phone?phone=${encodeURIComponent(result.phoneNumber)}`, { replace: true });
 })
 .catch((errorMessage: string) => {
 sileo.error({ title: errorMessage });
 setFormError(errorMessage);
 setFocus("phoneNumber");
 })
 .finally(() => setIsSubmitting(false));
 };

 const passwordEndContent = (visible: boolean, toggle: () => void, label: string) => (
 <button
 type="button"
 onClick={toggle}
 className="flex items-center justify-center p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-focus-ring)] focus-visible:rounded cursor-pointer"
 aria-label={label}
 >
 {visible
 ? <FaEyeSlash className="text-lg text-default-400 pointer-events-none" />
 : <FaRegEye className="text-lg text-default-400 pointer-events-none" />
 }
 </button>
 );

 return (
 <form onSubmit={handleSubmit(onSubmit)} className="auth-form auth-form--wide">
 {formError && (
 <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
 {formError}
 </div>
 )}
 <header className="auth-header">
 <span className="auth-kicker">انضم إلى محامي سمارت</span>
 <h1 className="auth-heading">أنشئ حسابك</h1>
 <p className="auth-subtitle">
 أدخل بياناتك لتبدأ استخدام أدوات التحليل القانوني الذكية.
 </p>
 </header>

 <div className="auth-input-group mb-4">
 <label htmlFor="signup-fullname" className="auth-input-label">الاسم الكامل</label>
 <CustomInput
 id="signup-fullname"
 type="text"
 placeholder="الاسم بالكامل"
 isInvalid={!!errors.fullName}
 errorMessage={errors.fullName?.message}
 startContent={<HiOutlineUser className="text-lg text-default-400" />}
 autoComplete="name"
 {...register('fullName')}
 />
 </div>

 <div className="auth-input-group mb-4">
 <label htmlFor="signup-phone" className="auth-input-label">رقم الموبايل</label>
 <CustomInput
 id="signup-phone"
 type="tel"
 placeholder="01012345678"
 isInvalid={!!errors.phoneNumber}
 errorMessage={errors.phoneNumber?.message}
 startContent={<HiOutlinePhone className="text-lg text-default-400" />}
 autoComplete="tel"
 {...register('phoneNumber')}
 />
 </div>

 <div className="auth-input-group mb-3">
 <label htmlFor="signup-email" className="auth-input-label">البريد الإلكتروني</label>
 <CustomInput
 id="signup-email"
 type="email"
 placeholder="lawyer@firm.com"
 isInvalid={!!errors.email}
 errorMessage={errors.email?.message}
 startContent={<HiOutlineEnvelope className="text-lg text-default-400" />}
 autoComplete="email"
 {...register('email')}
 />
 </div>

 <div className="auth-input-group mb-3">
 <label htmlFor="signup-governorate" className="auth-input-label">المحافظة</label>
 <select
 id="signup-governorate"
 {...register('governorate')}
 className="auth-select"
 defaultValue=""
 aria-invalid={!!errors.governorate}
 >
 <option value="" disabled>اختر المحافظة</option>
 {EGYPT_GOVERNORATES.map((gov) => (
 <option key={gov} value={gov}>{gov}</option>
 ))}
 </select>
 {errors.governorate && (
 <span className="auth-field-error">{errors.governorate.message}</span>
 )}
 </div>

 <div className="auth-input-group mb-3">
 <label htmlFor="signup-password" className="auth-input-label">كلمة المرور</label>
 <CustomInput
 id="signup-password"
 type={showPassword ?"text" :"password"}
 placeholder="••••••••"
 description="6 أحرف على الأقل، تتضمن حرفاً كبيراً وصغيراً، ورقم، ورمز خاص"
 isInvalid={!!errors.password}
 errorMessage={errors.password?.message}
 startContent={<HiOutlineLockClosed className="text-lg text-default-400" />}
 endContent={passwordEndContent(showPassword, () => setShowPassword(!showPassword),"إظهار أو إخفاء كلمة المرور")}
 autoComplete="new-password"
 {...register('password')}
 />
 </div>

 <div className="auth-input-group mb-4">
 <label htmlFor="signup-password-confirm" className="auth-input-label">تأكيد كلمة المرور</label>
 <CustomInput
 id="signup-password-confirm"
 type={showConfirm ?"text" :"password"}
 placeholder="••••••••"
 isInvalid={!!errors.passwordConfirmation}
 errorMessage={errors.passwordConfirmation?.message}
 startContent={<HiOutlineLockClosed className="text-lg text-default-400" />}
 endContent={passwordEndContent(showConfirm, () => setShowConfirm(!showConfirm),"إظهار أو إخفاء تأكيد كلمة المرور")}
 autoComplete="new-password"
 {...register('passwordConfirmation')}
 />
 </div>

 <div className="auth-terms-group">
 <Checkbox
 size="sm"
 classNames={{
 label:"text-sm font-medium",
 wrapper:"me-2",
 }}
 isSelected={!!agreeToTerms}
 onChange={(e) => setValue('agreeToTerms', e.target.checked, { shouldValidate: true })}
 >
 أوافق على <Link to="/terms-conditions" className="text-[var(--main-color)] hover:underline" target="_blank">الشروط والأحكام</Link> و<Link to="/privacy-policy" className="text-[var(--main-color)] hover:underline" target="_blank">سياسة الخصوصية</Link>
 </Checkbox>
 {errors.agreeToTerms && (
 <span className="auth-field-error">{errors.agreeToTerms.message}</span>
 )}
 </div>

 <CustomButton
 type="submit"
 text={isSubmitting ?"تأمين حسابك..." :"إنشاء الحساب"}
 fullWidth
 size="lg"
 radius="md"
 isLoading={isSubmitting}
 endContent={!isSubmitting ? <IoIosArrowForward /> : undefined}
 />

 <p className="auth-form-footer">
 لديك حساب بالفعل؟{''}
 <Link to='/auth/login'>تسجيل الدخول</Link>
 </p>

 <p className="auth-meta-note">
 بعد إنشاء الحساب سنوجّهك مباشرةً لتأكيد الهاتف واستكمال بدء الاستخدام.
 </p>
 </form>
 );
};

export default SignUp;
