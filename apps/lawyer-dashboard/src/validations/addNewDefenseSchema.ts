import z from"zod";

const addNewDefenseSchema = z.object({
 defense: z.string()
 .nonempty("الرجاء إدخال وقائع القضية")
 .min(10,"الحد الأدنى 10 حروف")
 .max(5000,"الحد الأقصى 5000 حرف")
})

type addNewDefenseSchemaType = z.infer<typeof addNewDefenseSchema>;
export { addNewDefenseSchema, type addNewDefenseSchemaType };