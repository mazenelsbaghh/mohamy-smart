import { CustomButton, CustomInput } from'@mohamy/shared-ui';
import { useState } from"react";
import { Link, useLocation, useNavigate } from"react-router-dom";
import { Checkbox } from "@heroui/react";
import { Scale } from "lucide-react";

import { useForm, type SubmitHandler } from"react-hook-form";
import { loginSchema, type loginSchemaType } from"../../validations/loginSchema";
import { zodResolver } from"@hookform/resolvers/zod";
import { useAppDispatch } from"../../hooks/reduxHooks";
import thunkAuthLogin from"../../redux/auth/thunk/thunkAuthLogin";
import thunkRequestPhoneVerification from"../../redux/auth/thunk/thunkRequestPhoneVerification";
import { sileo } from"sileo";
import { HiOutlinePhone, HiOutlineLockClosed } from"react-icons/hi2";
import { IoIosArrowForward } from"react-icons/io";
import { FaRegEye, FaEyeSlash } from"react-icons/fa";

const extractCooldownSeconds = (message: string) => {
 const match = message.match(/(?:خلال|الانتظار)\s+(\d+)\s+ثانية/);
 return match?.[1] ? parseInt(match[1], 10) : null;
};

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
 .catch(async (errorMessage: string) => {
 sileo.error({ title: errorMessage });
 setFormError(errorMessage);
 setFocus("phone");
 if (errorMessage.includes('يجب تأكيد رقم الهاتف')) {
 let secondsToWait = 60;
 try {
 const resultMsg = await dispatch(thunkRequestPhoneVerification({ phoneNumber: data.phone })).unwrap();
 sileo.success({ title: typeof resultMsg === 'string' ? resultMsg : 'تم إرسال رمز التحقق إلى رقمك' });
 if (typeof resultMsg === 'string') {
 const cooldown = extractCooldownSeconds(resultMsg);
 if (cooldown !== null) secondsToWait = cooldown;
 }
 } catch (err: unknown) {
 if (typeof err === 'string') {
 const cooldown = extractCooldownSeconds(err);
 if (cooldown !== null) {
 secondsToWait = cooldown;
 sileo.error({ title: err });
 navigate(`/auth/verify-phone?phone=${encodeURIComponent(data.phone)}`, { state: { cooldown: secondsToWait } });
 return;
 }
 sileo.error({ title: err });
 setFormError(err);
 return;
 }
 const fallbackMessage = 'تعذر إرسال رمز التحقق. حاول مرة أخرى بعد قليل.';
 sileo.error({ title: fallbackMessage });
 setFormError(fallbackMessage);
 return;
 }
 navigate(`/auth/verify-phone?phone=${encodeURIComponent(data.phone)}`, { state: { cooldown: secondsToWait } });
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
        <div className="auth-welcome-title-large flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#EF950A]" />
          <span>مرحبًا بك في <span className="font-extrabold text-[#EF950A]">محامي سمارت</span></span>
        </div>
        <h1 className="auth-heading">تسجيل الدخول</h1>
        <p className="auth-subtitle">
          الرجاء إدخال رقم الهاتف وكلمة المرور للوصول إلى منصتك القانونية الذكية.
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

      <div className="auth-input-group mb-6">
        <div className="auth-input-header w-full">
          <label htmlFor="login-password" className="auth-input-label">كلمة المرور</label>
          <Link to='/auth/forgot-password' className="auth-forgot-inline">
            نسيت كلمة المرور؟
          </Link>
        </div>
        <CustomInput
          id="login-password"
          type={showPassword ? "text" : "password"}
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

      <div className="flex items-center justify-start mb-6">
        <Checkbox
          size="sm"
          classNames={{
            label: "text-sm font-medium text-default-600",
            wrapper: "me-2",
          }}
          color="warning"
          defaultSelected
        >
          تذكرني
        </Checkbox>
      </div>

      <CustomButton
        type="submit"
        text={isSubmitting ? "جاري التحقق..." : "تسجيل الدخول"}
        fullWidth
        size="lg"
        radius="md"
        isLoading={isSubmitting}
        endContent={!isSubmitting ? <IoIosArrowForward /> : undefined}
      />

      <p className="auth-form-footer">
        ليس لديك حساب؟{' '}
        <Link to='/auth/sign-up'>قم بالتسجيل</Link>
      </p>

      <p className="auth-meta-note">
        بتسجيل الدخول، يمكنك متابعة القضايا والمستندات والتنبيهات من مكان واحد.
      </p>
    </form>
  );
};

export default Login;
