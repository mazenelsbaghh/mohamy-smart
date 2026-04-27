import z from"zod";

const addNewContractsSchema = z.object({
 contractName: z.string()
 .nonempty("اسم العقد مطلوب")
 .min(2,"اسم الموكل يجب أن يكون على الأقل 2 أحرف")
 .max(50,"اسم الموكل لا يجب أن يزيد عن 50 حرف"),
 contractType: z.enum(['عقد إيجار','عقد بيع','عقد عمل','مذكرة دعوى','لائحة دعوى','مذكرة دفاع','توكيل','اعتراض','طعن'], { message:"نوع العقد مطلوب" }),
 notes: z.string()
 .max(500,"الملاحظات لا يجب أن تزيد عن 500 حرف")
 .optional(),
});

type addNewContractsType = z.infer<typeof addNewContractsSchema>;
export { addNewContractsSchema, type addNewContractsType }