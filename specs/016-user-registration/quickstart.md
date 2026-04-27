# Quickstart: User Registration Fields

## Backend Integration

1. Review Entity models in `Lawyer.Core/Entities/` to ensure `MobileNumber`, `Governorate`, and `FullName` properties exist. If not, add them.
2. In `Lawyer.Application/DTOs/`, create a `RegisterDto` housing the requested fields.
3. In `Lawyer.Application/Services/`, update or implement the Registration service to hash the password and persist the user, explicitly adding validation for `Db.Users.AnyAsync(u => u.Email == dto.Email || u.MobileNumber == dto.MobileNumber)`.
4. Run `make db-migrate` if any core entity fields were added or altered.
5. In `Lawyer/Controllers/`, expose `POST /api/auth/register` returning `201 Created` on success, `409` on duplicate, `400` on validation errors.

## Frontend Integration (Landing or Dashboard)

1. Scaffold the Registration UI component with `react-hook-form`.
2. Apply `zod` for client-side validation logic:
   ```typescript
   const registerSchema = z.object({
     fullName: z.string().min(1, "الاسم الكامل مطلوب"),
     mobileNumber: z.string().min(1, "رقم الموبايل مطلوب"),
     email: z.string().email("صيغة البريد الإلكتروني غير صحيحة"),
     password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
     passwordConfirmation: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
     governorate: z.string().min(1, "المحافظة مطلوبة"),
     agreeToTerms: z.literal(true, {
       errorMap: () => ({ message: "يجب الموافقة على الشروط" }),
     }),
   }).refine((data) => data.password === data.passwordConfirmation, {
     message: "كلمات المرور غير متطابقة",
     path: ["passwordConfirmation"],
   });
   ```
3. Submit the form via Axios to `POST /api/auth/register`.
4. Standardize text strictly in Arabic (RTL UI) as per constitution rules.
