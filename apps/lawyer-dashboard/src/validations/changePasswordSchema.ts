import { z } from'zod';

export const changePasswordSchema = z.object({
 currentPassword: z.string().min(6,"تتطلب كلمة المرور 6 أحرف على الأقل"),
 otpCode: z.string().length(6,"رمز التحقق يجب أن يتكون من 6 أرقام"),
 newPassword: z.string().min(6,"تتطلب كلمة المرور 6 أحرف على الأقل"),
 confirmPassword: z.string().min(6,"تتطلب كلمة المرور 6 أحرف على الأقل"),
}).refine(data => data.newPassword === data.confirmPassword, {
 message:"كلمات المرور غير متطابقة",
 path: ["confirmPassword"],
});

export type TChangePasswordSchema = z.infer<typeof changePasswordSchema>;
