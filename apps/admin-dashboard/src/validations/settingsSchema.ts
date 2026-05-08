import { z } from'zod';
import { passwordSchema } from'@mohamy/shared-validations';

export const updateProfileSchema = z.object({
 fullName: z.string().min(1,'الاسم الكامل مطلوب'),
 email: z.string().email('بريد إلكتروني غير صالح').min(1,'البريد الإلكتروني مطلوب'),
 phoneNumber: z.string().min(1,'رقم الهاتف مطلوب'),
 officeName: z.string().nullable(),
 address: z.string().nullable(),
});

export const changePasswordSchema = z.object({
 currentPassword: z.string().min(1,'كلمة المرور الحالية مطلوبة'),
 newPassword: passwordSchema,
 confirmPassword: z.string().min(8,'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.newPassword === data.confirmPassword, {
 message:'كلمة المرور غير متطابقة',
 path: ['confirmPassword'],
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
