import { CustomButton, CustomInput } from'@mohamy/shared-ui';
import { useState } from"react";
import { Link, useLocation, useNavigate } from"react-router-dom";


import { useForm, type SubmitHandler } from"react-hook-form";
import { loginSchema, type loginSchemaType } from"../../validations/loginSchema";
import { zodResolver } from"@hookform/resolvers/zod";
import { useAppDispatch } from"../../hooks/reduxHooks";
import thunkAuthLogin from"../../redux/auth/thunk/thunkAuthLogin";
import { sileo } from"sileo";
import { HiOutlinePhone, HiOutlineLockClosed } from"react-icons/hi2";
import { IoIosArrowForward } from"react-icons/io";
import { FaRegEye, FaEyeSlash } from"react-icons/fa";

const Login = () => {
 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const location = useLocation();
 const [showPassword, setShowPassword] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formError, setFormError] = useState<string | null>(null);

 const { register, handleSubmit, setFocus, formState: { errors } } = useForm<loginSchemaType>({
 mode:'onChange',
 resolver: zodResolver(loginSchema),
 });

 const redirectTo = (location.state as { from?: string } | null)?.from ||'/';

 const onSubmit: SubmitHandler<loginSchemaType> = (data) => {
 setIsSubmitting(true);
 setFormError(null);
 dispatch(thunkAuthLogin(data)).unwrap()
 .then(() => {
 sileo.success({ title:"تم تسجيل الدخول بنجاح" });
 navigate(redirectTo, { replace: true });
 })
 .catch((errorMessage: string) => {
 sileo.error({ title: errorMessage });
 setFormError(errorMessage);
 setFocus("phone");
 if (errorMessage.includes('تأكيد رقم الهاتف')) {
 navigate(`/auth/verify-phone?phone=${encodeURIComponent(data.phone)}`);
 }
 })
 .finally(() => setIsSubmitting(false));
 };

 return (
 <form onSubmit={handleSubmit(onSubmit)} className="auth-form auth-form--compact">
 {formError && (
 <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
 {formError}
 </div>
 )}
 <header className="auth-header">
 <span className="auth-kicker">مساحة العمل القانونية الخاصة بك</span>
 <h1 className="auth-heading">مرحبًا بعودتك</h1>
 <p className="auth-subtitle">
 سجل دخولك لإدارة أعمالك وملفاتك القانونية بكفاءة واحترافية مدعومة بالذكاء الاصطناعي.
 </p>
 </header>

 <div className="auth-input-group mb-6">
 <label htmlFor="login-phone" className="auth-input-label">رقم الهاتف</label>
 <CustomInput
 id="login-phone"
 type="tel"
 placeholder="01012345678"
 isInvalid={!!errors.phone}
 errorMessage={errors.phone?.message}
 startContent={<HiOutlinePhone className="text-xl text-default-400" />}
 autoComplete="username"
 {...register('phone', { onChange: () => formError && setFormError(null) })}
 />
 </div>

 <div className="auth-input-group mb-8">
 <div className="auth-input-header w-full">
 <label htmlFor="login-password" className="auth-input-label">كلمة المرور</label>
 <Link to='/auth/forgot-password' className="auth-forgot-inline">
 نسيت كلمة المرور؟
 </Link>
 </div>
 <CustomInput
 id="login-password"
 type={showPassword ?"text" :"password"}
 placeholder="••••••••"
 isInvalid={!!errors.password}
 errorMessage={errors.password?.message}
 startContent={<HiOutlineLockClosed className="text-xl text-default-400" />}
 endContent={
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="flex items-center justify-center p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-focus-ring)] focus-visible:rounded cursor-pointer"
 aria-label="إظهار أو إخفاء كلمة المرور"
 >
 {showPassword
 ? <FaEyeSlash className="text-xl text-default-400 pointer-events-none" />
 : <FaRegEye className="text-xl text-default-400 pointer-events-none" />
 }
 </button>
 }
 autoComplete="current-password"
 {...register('password', { onChange: () => formError && setFormError(null) })}
 />
 </div>

 <CustomButton
 type="submit"
 text={isSubmitting ?"جاري التحقق..." :"تسجيل الدخول"}
 fullWidth
 size="lg"
 radius="md"
 isLoading={isSubmitting}
 endContent={!isSubmitting ? <IoIosArrowForward /> : undefined}
 />

 <p className="auth-form-footer">
 ليس لديك حساب؟{''}
 <Link to='/auth/sign-up'>قم بالتسجيل</Link>
 </p>

 <p className="auth-meta-note">
 بتسجيل الدخول، يمكنك متابعة القضايا والمستندات والتنبيهات من مكان واحد.
 </p>
 </form>
 );
};

export default Login;
