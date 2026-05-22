import { CustomButton, CustomInput } from '@mohamy/shared-ui';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@heroui/react";
import { FaScaleBalanced } from "react-icons/fa6";

import { useForm, type SubmitHandler } from "react-hook-form";
import { loginSchema, type loginSchemaType } from "../../validations/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "../../redux/hooks";
import thunkAuthLogin from "../../redux/auth/thunk/thunkAuthLogin";
import { sileo } from "sileo";
import { HiOutlineEnvelope, HiOutlineLockClosed } from "react-icons/hi2";
import { IoIosArrowForward } from "react-icons/io";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, setFocus, formState: { errors } } = useForm<loginSchemaType>({
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<loginSchemaType> = (data) => {
    setIsSubmitting(true);
    setFormError(null);
    dispatch(thunkAuthLogin(data)).unwrap()
      .then(() => {
        sileo.success({ title: "تم تسجيل الدخول بنجاح" });
        navigate('/', { replace: true });
      })
      .catch((errorMessage: string) => {
        sileo.error({ title: errorMessage });
        setFormError(errorMessage);
        setFocus("email");
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
          <FaScaleBalanced className="w-5 h-5 text-[#EF950A]" />
          <span>مرحبًا بك في <span className="font-extrabold text-[#EF950A]">محامي سمارت</span></span>
        </div>
        <h1 className="auth-heading">تسجيل الدخول</h1>
        <p className="auth-subtitle">
          الرجاء إدخال البريد الإلكتروني وكلمة المرور للوصول إلى لوحة إدارة المنصة.
        </p>
      </header>

      <div className="auth-input-group mb-6">
        <label htmlFor="login-email" className="auth-input-label">البريد الإلكتروني</label>
        <CustomInput
          id="login-email"
          type="email"
          placeholder="admin@mohamy.com"
          isInvalid={!!errors.email}
          errorMessage={errors.email?.message}
          startContent={<HiOutlineEnvelope className="text-xl text-default-400" />}
          autoComplete="username"
          {...register('email', { onChange: () => formError && setFormError(null) })}
        />
      </div>

      <div className="auth-input-group mb-6">
        <div className="auth-input-header w-full">
          <label htmlFor="login-password" className="auth-input-label">كلمة المرور</label>
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

      <p className="auth-meta-note">
        بتسجيل الدخول، يمكنك متابعة لوحة إدارة المنصة والتحكم بالمستخدمين بكفاءة واحترافية.
      </p>
    </form>
  );
};

export default Login;
