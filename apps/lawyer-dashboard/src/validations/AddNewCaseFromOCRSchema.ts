import z from"zod";
import { normalizeDigits } from"@mohamy/shared-utils";

const egyptianPhoneRegex = /^(?:\+20|0020|0)?1[0125]\d{8}$/;
const egyptianNationalIdRegex = /^[23]\d{13}$/;

const addNewCaseFromOCRSchema = z.object({
 caseTitle: z.string()
 .nonempty("عنوان القضية مطلوب")
 .min(3,"عنوان القضية يجب أن يكون 3 أحرف على الأقل")
 .max(100,"عنوان القضية لا يجب أن يزيد عن 100 حرف"),
 caseNumber: z.string()
 .nonempty("رقم القضية مطلوب")
 .max(300,"رقم القضية لا يجب أن يزيد عن 300 حرف"),

 // Array of selected case type IDs (strings from Select keys). Min 1 required.
 caseTypes: z.array(z.string()).min(1,"يجب اختيار نوع قضية واحد على الأقل"),

 clientName: z.string()
 .nonempty("اسم الموكل مطلوب")
 .min(2,"اسم الموكل يجب أن يكون على الأقل حرفين")
 .max(100,"اسم الموكل لا يجب أن يزيد عن 100 حرف"),

 // New client fields: optional, but validated when filled before calling /Client/create.
 newClientPhone: z.string()
 .transform((val) => normalizeDigits(val).trim())
 .refine((val) => val ==='' || egyptianPhoneRegex.test(val), {
 message:"صيغة رقم الهاتف غير صحيحة",
 })
 .optional(),
 newClientEmail: z.string().email("البريد الإلكتروني غير صالح").or(z.string().length(0)).optional().nullable(),
 newClientNationalId: z.string()
 .transform((val) => normalizeDigits(val).trim())
 .refine((val) => val ==='' || egyptianNationalIdRegex.test(val), {
 message:"الرقم القومي يجب أن يكون 14 رقم صحيح",
 })
 .optional()
 .nullable(),
 newClientGovernorate: z.string().optional().nullable(),
 newClientAddress: z.string().optional().nullable(),
 newClientNotes: z.string().optional().nullable(),

 opponentName: z.string()
 .max(100,"اسم الخصم لا يجب أن يزيد عن 100 حرف")
 .optional(),

 defendingParty: z.enum(['client','opponent']),

 court: z.string()
 .max(300,"اسم المحكمة لا يجب أن يزيد عن 300 حرف"),

 caseDescription: z.string()
 .nonempty("وصف القضية مطلوب")
 .min(10,"الوصف يجب أن يكون 10 أحرف على الأقل")
 .max(5000,"الوصف لا يجب أن يزيد عن 5000 حرف"),

 caseFacts: z.string()
 .nonempty("وقائع القضية مطلوبة")
 .min(10,"وقائع القضية يجب أن تكون 10 أحرف على الأقل")
 .max(5000,"وقائع القضية لا يجب أن تزيد عن 5000 حرف"),

 legalRequests: z.string()
 .nonempty("الطلبات القانونية مطلوبة")
 .min(5,"الطلبات القانونية يجب أن تكون 5 أحرف على الأقل")
 .max(5000,"الطلبات القانونية لا يجب أن تزيد عن 5000 حرف"),

 internalRegulationIds: z.array(z.string()).optional(),

 powerOfAttorneyId: z.string().optional(),
});

type addNewCaseFromOCRType = z.infer<typeof addNewCaseFromOCRSchema>;
export { addNewCaseFromOCRSchema, type addNewCaseFromOCRType };
