import { CustomButton, CustomInput } from'@mohamy/shared-ui';
import { useState } from"react";
import { useNavigate } from"react-router-dom";


import { useForm, type SubmitHandler } from"react-hook-form";
import { zodResolver } from"@hookform/resolvers/zod";
import { loginSchema, type loginSchemaType } from"../../validations/loginSchema";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";
import thunkAuthLogin from"../../redux/auth/thunk/thunkAuthLogin";
import { HiOutlineEnvelope, HiOutlineLockClosed } from"react-icons/hi2";
import { IoIosArrowForward } from"react-icons/io";
import { FaRegEye, FaEyeSlash } from"react-icons/fa";

const Login = () => {
 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const { isLoading } = useAppSelector((state) => state.auth);
 const [showPassword, setShowPassword] = useState(false);

 const { register, handleSubmit, formState: { errors } } = useForm<loginSchemaType>({
 mode:'onChange',
 resolver: zodResolver(loginSchema),
 });

 const onSubmit: SubmitHandler<loginSchemaType> = async (data) => {
 const result = await dispatch(thunkAuthLogin(data));
 if (thunkAuthLogin.fulfilled.match(result)) {
 navigate("/");
 }
 };

 return (
 <form onSubmit={handleSubmit(onSubmit)} className="auth-form auth-form--compact">
 <header className="auth-header">
 <span className="auth-kicker">بوابة إدارة محامي سمارت</span>
 <h1 className="auth-heading">مرحباً بك في لوحة الإدارة</h1>
 <p className="auth-subtitle">
 سجل دخولك الآن للتحكم الكامل في المنصة وإدارة المستخدمين بكفاءة واحترافية.
 </p>
 </header>

 <div className="auth-input-group mb-6">
 <label htmlFor="admin-email" className="auth-input-label">البريد الإلكتروني</label>
 <CustomInput
 id="admin-email"
 type="email"
 placeholder="admin@mohamy.com"
 isInvalid={!!errors.email}
 errorMessage={errors.email?.message}
 startContent={<HiOutlineEnvelope className="text-xl text-default-400" />}
 autoComplete="email"
 {...register('email')}
 />
 </div>

 <div className="auth-input-group mb-8">
 <div className="auth-input-header w-full">
 <label htmlFor="admin-password" className="auth-input-label">كلمة المرور</label>
 </div>
 <CustomInput
 id="admin-password"
 type={showPassword ?"text" :"password"}
 placeholder="••••••••"
 isInvalid={!!errors.password}
 errorMessage={errors.password?.message}
 startContent={<HiOutlineLockClosed className="text-xl text-default-400" />}
 endContent={
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="flex items-center justify-center p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF950A] focus-visible:rounded cursor-pointer"
 aria-label="إظهار أو إخفاء كلمة المرور"
 >
 {showPassword
 ? <FaEyeSlash className="text-xl text-default-400 pointer-events-none" />
 : <FaRegEye className="text-xl text-default-400 pointer-events-none" />
 }
 </button>
 }
 autoComplete="current-password"
 {...register('password')}
 />
 </div>

 <CustomButton
 type="submit"
 text={isLoading ?'جارٍ تسجيل الدخول...' :'تسجيل الدخول'}
 fullWidth
 size="lg"
 radius="md"
 isLoading={isLoading}
 endContent={!isLoading ? <IoIosArrowForward /> : undefined}
 />

 <p className="auth-meta-note">
 استخدم حساب الإدارة للوصول إلى المتابعة التشغيلية والتقارير وإدارة المنصة.
 </p>
 </form>
 );
};

export default Login;
