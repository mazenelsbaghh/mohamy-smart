import z from"zod";

const chatFormSchema = z.object({
 message: z
 .string()
 .nonempty("اكتب رسالة")
 .max(1000,"الرسالة لا يجب أن تزيد عن 1000 حرف"),
});

type chatFormType = z.infer<typeof chatFormSchema>;
export { chatFormSchema, type chatFormType };