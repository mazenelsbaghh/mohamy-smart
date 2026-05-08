import { z } from'zod';

// ── Session Schema ───────────────────────────────────────────────
export const sessionSchema = z.object({
 type: z.literal('Session'),
 title: z.string().min(1,'عنوان الجلسة مطلوب'),
 date: z.string().min(1,'تاريخ الجلسة مطلوب'),
 endDate: z.string().nullable().optional(),
 status: z.enum(['Scheduled','Completed','Postponed','Cancelled'], {
 message:'حالة الجلسة مطلوبة',
 }),
 sessionType: z.string().min(1,'نوع الجلسة مطلوب'),
 courtName: z.string().min(1,'اسم المحكمة مطلوب'),
 previousSessionId: z.string().nullable().optional(),
 postponementReason: z.string().nullable().optional(),
 previousDecision: z.string().nullable().optional(),
 assignedLawyerId: z.string().nullable().optional(),
}).refine(
 (data) => {
 if (data.previousSessionId && data.previousSessionId.length > 0) {
 return !!data.postponementReason && data.postponementReason.length > 0;
 }
 return true;
 },
 {
 message:'سبب التأجيل مطلوب عند ربط جلسة سابقة',
 path: ['postponementReason'],
 }
);

export type SessionFormData = z.infer<typeof sessionSchema>;

// ── Action Schema ────────────────────────────────────────────────
export const actionSchema = z.object({
 type: z.literal('Action'),
 title: z.string().min(1,'عنوان الإجراء مطلوب'),
 date: z.string().min(1,'تاريخ الإجراء مطلوب'),
 endDate: z.string().nullable().optional(),
 status: z.enum(['Scheduled','Completed','Postponed','Cancelled'], {
 message:'حالة الإجراء مطلوبة',
 }),
 actionType: z.enum(['Inspection','Execution'], {
 message:'نوع الإجراء مطلوب',
 }),
 executionDetails: z.string().min(1,'تفاصيل الإجراء مطلوبة'),
 location: z.string().nullable().optional(),
});

export type ActionFormData = z.infer<typeof actionSchema>;
