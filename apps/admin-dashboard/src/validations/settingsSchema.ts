import { z } from'zod';

export const updateProfileSchema = z.object({
 fullName: z.string().min(1,'الاسم الكامل مطلوب'),
 email: z.string().email('بريد إلكتروني غير صالح').min(1,'البريد الإلكتروني مطلوب'),
 phoneNumber: z.string().min(1,'رقم الهاتف مطلوب'),
 officeName: z.string().nullable(),
 address: z.string().nullable(),
});

export const changePasswordSchema = z.object({
 currentPassword: z.string().min(6,'كلمة المرور الحالية يجب أن تكون 6 أحرف على الأقل'),
 newPassword: z.string().min(6,'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
 confirmPassword: z.string().min(6,'تأكيد كلمة المرور يجب أن يكون 6 أحرف على الأقل'),
}).refine((data) => data.newPassword === data.confirmPassword, {
 message:'كلمة المرور غير متطابقة',
 path: ['confirmPassword'],
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
