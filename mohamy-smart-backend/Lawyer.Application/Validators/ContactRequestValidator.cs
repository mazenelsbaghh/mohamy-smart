using FluentValidation;
using Lawyer.Application.Common;
using Lawyer.Application.Dtos.Contact;

namespace Lawyer.Application.Validators
{
    public class SubmitContactRequestValidator : AbstractValidator<SubmitContactRequestDto>
    {
        public SubmitContactRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("الاسم مطلوب")
                .MaximumLength(100).WithMessage("الاسم يجب ألا يتجاوز 100 حرف");
            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("رقم الهاتف مطلوب")
                .MaximumLength(20).WithMessage("رقم الهاتف يجب ألا يتجاوز 20 حرف");
            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("الرسالة مطلوبة")
                .MaximumLength(5000).WithMessage("الرسالة يجب ألا تتجاوز 5000 حرف");
        }
    }
}
