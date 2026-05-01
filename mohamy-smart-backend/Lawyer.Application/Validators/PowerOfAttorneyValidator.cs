using FluentValidation;
using Lawyer.Application.DTOs.POA;

namespace Lawyer.Application.Validators
{
    public class CreatePowerOfAttorneyValidator : AbstractValidator<PowerOfAttorneyDto>
    {
        public CreatePowerOfAttorneyValidator()
        {
            RuleFor(x => x.Number)
                .NotEmpty().WithMessage("رقم التوكيل مطلوب")
                .MaximumLength(100).WithMessage("رقم التوكيل يجب ألا يتجاوز 100 حرف");
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("عنوان التوكيل مطلوب")
                .MaximumLength(200).WithMessage("عنوان التوكيل يجب ألا يتجاوز 200 حرف");
            RuleFor(x => x.IssuingAuthority)
                .NotEmpty().WithMessage("جهة الإصدار مطلوبة")
                .MaximumLength(200).WithMessage("جهة الإصدار يجب ألا تتجاوز 200 حرف");
            RuleFor(x => x.IssueDate)
                .NotEmpty().WithMessage("تاريخ الإصدار مطلوب")
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("تاريخ الإصدار يجب ألا يكون في المستقبل");
        }
    }
}
