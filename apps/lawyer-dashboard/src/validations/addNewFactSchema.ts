import z from"zod";

const addNewFactSchema = z.object({
 fact: z.string()
 .nonempty("الرجاء إدخال وقائع القضية")
 .min(10,"الحد الأدنى 10 حروف")
 .max(5000,"الحد الأقصى 5000 حرف")
});

type addNewFactSchemaType = z.infer<typeof addNewFactSchema>;
export { addNewFactSchema, type addNewFactSchemaType };

