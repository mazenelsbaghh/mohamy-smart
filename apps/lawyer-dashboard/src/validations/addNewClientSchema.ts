import z from"zod";
import { normalizeDigits } from"@mohamy/shared-utils";

const egyptianPhoneRegex = /^(?:\+20|0020|0)?1[0125]\d{8}$/;
const egyptianNationalIdRegex = /^[23]\d{13}$/;

const addNewClientSchema = z.object({
 fullName: z.string()
 .nonempty("الاسم مطلوب")
 .min(2,"الاسم يجب أن يكون على الأقل 2 أحرف")
 .max(50,"الاسم لا يجب أن يزيد عن 50 حرف"),

 phone: z.string()
 .transform((val) => normalizeDigits(val).trim())
 .pipe(
 z.string()
 .min(1,"رقم الهاتف مطلوب")
 .regex(egyptianPhoneRegex,"صيغة رقم الهاتف غير صحيحة")
 ),

 email: z.string()
 .email("البريد الإلكتروني غير صالح")
 .or(z.string().length(0))
 .optional()
 .nullable(),

 address: z.string().optional().nullable(),
 nationalId: z.string()
 .transform((val) => normalizeDigits(val).trim())
 .refine((val) => val ==='' || egyptianNationalIdRegex.test(val), {
 message:"الرقم القومي يجب أن يكون 14 رقم صحيح",
 })
 .optional()
 .nullable(),
 governorate: z.string().optional().nullable(),

 notes: z.string().optional().nullable(),
});

type addNewClientType = z.infer<typeof addNewClientSchema>;
export { addNewClientSchema, type addNewClientType };
