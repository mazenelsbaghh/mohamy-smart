import { z } from'zod';

export const profileSchema = z.object({
 fullName: z.string().min(3,"الاسم يجب أن يحتوي على 3 أحرف على الأقل"),
 email: z.string().email("البريد الإلكتروني غير صالح"),
 phoneNumber: z.string().min(8,"رقم الهاتف غير صالح"),
 officeName: z.string().min(2,"اسم المكتب مطلوب"),
});

export type TProfileSchema = z.infer<typeof profileSchema>;
