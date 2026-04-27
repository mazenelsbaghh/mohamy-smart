import { z } from "zod";
import { passwordSchema, emailSchema, phoneSchema } from "./common";

export const lawyerLoginSchema = z.object({
    phone: phoneSchema,
    password: passwordSchema
});

export const adminLoginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'كلمة المرور مطلوبة').min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف").max(30, "كلمة المرور لا يجب أن تزيد عن 30 حرف")
});

export const signupSchema = z.object({
    fullName: z.string().min(1, "الاسم الكامل مطلوب"),
    phoneNumber: phoneSchema,
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
    governorate: z.string().min(1, "المحافظة مطلوبة"),
    agreeToTerms: z.boolean().refine((val: boolean) => val === true, {
        message: "يجب الموافقة على الشروط والأحكام",
    }),
}).refine((data) => data.password === data.passwordConfirmation, {
    message: "كلمات المرور غير متطابقة",
    path: ["passwordConfirmation"],
});

export const forgotPasswordRequestSchema = z.object({
    phoneNumber: phoneSchema,
});

export const verifyOtpSchema = z.object({
    code: z.string()
        .length(6, "رمز التحقق يجب أن يتكون من 6 أرقام")
        .regex(/^\d{6}$/, "رمز التحقق غير صالح"),
});

export const resetPasswordSchema = z.object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
});

export type LawyerLoginSchemaType = z.infer<typeof lawyerLoginSchema>;
export type AdminLoginSchemaType = z.infer<typeof adminLoginSchema>;
export type SignupSchemaType = z.infer<typeof signupSchema>;
export type TForgotPasswordRequestSchema = z.infer<typeof forgotPasswordRequestSchema>;
export type TVerifyOtpSchema = z.infer<typeof verifyOtpSchema>;
export type TResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
