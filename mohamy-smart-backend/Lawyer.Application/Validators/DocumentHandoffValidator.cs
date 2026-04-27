using FluentValidation;
using Lawyer.Application.DTOs.Client;

namespace Lawyer.Application.Validators
{
    public class CreateDocumentHandoffValidator : AbstractValidator<CreateDocumentHandoffDto>
    {
        private static readonly string[] AllowedExtensions = { ".pdf", ".jpg", ".jpeg", ".png", ".webp" };

        public CreateDocumentHandoffValidator()
        {
            RuleFor(x => x.ClientId)
                .NotEmpty().WithMessage("معرف العميل مطلوب");
            RuleFor(x => x.DocumentName)
                .NotEmpty().WithMessage("اسم المستند مطلوب")
                .MaximumLength(200).WithMessage("اسم المستند يجب ألا يتجاوز 200 حرف");
            RuleFor(x => x.DeliveryDate)
                .NotEmpty().WithMessage("تاريخ التسليم مطلوب");
            RuleFor(x => x.ReceiptFile)
                .Must(f => f == null || f.Length <= 10 * 1024 * 1024)
                .WithMessage("حجم الملف يجب ألا يتجاوز 10 ميجابايت")
                .Must(f => f == null || AllowedExtensions.Contains(
                    System.IO.Path.GetExtension(f.FileName).ToLowerInvariant()))
                .WithMessage("نوع الملف غير مدعوم. الأنواع المسموحة: PDF, JPG, PNG, WEBP");
        }
    }
}
