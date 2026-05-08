import { z } from'zod';
import { passwordSchema } from'@mohamy/shared-validations';

export const changePasswordSchema = z.object({
 currentPassword: z.string().min(1,"كلمة المرور الحالية مطلوبة"),
 otpCode: z.string().length(6,"رمز التحقق يجب أن يتكون من 6 أرقام"),
 newPassword: passwordSchema,
 confirmPassword: z.string().min(8,"تأكيد كلمة المرور مطلوب"),
}).refine(data => data.newPassword === data.confirmPassword, {
 message:"كلمات المرور غير متطابقة",
 path: ["confirmPassword"],
});

export type TChangePasswordSchema = z.infer<typeof changePasswordSchema>;
