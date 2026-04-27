using FluentValidation;
using Lawyer.Application.Dtos.Case;

namespace Lawyer.Application.Validators
{
    public class CreateCaseValidator : AbstractValidator<CreateCaseDto>
    {
        public CreateCaseValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("عنوان القضية مطلوب")
                .MaximumLength(200).WithMessage("عنوان القضية يجب ألا يتجاوز 200 حرف");
             RuleFor(x => x.Number)
                 .NotEmpty().WithMessage("رقم القضية مطلوب")
                 .MaximumLength(50).WithMessage("رقم القضية يجب ألا يتجاوز 50 حرف");
             RuleFor(x => x.Court)
                 .MaximumLength(100).WithMessage("اسم المحكمة يجب ألا يتجاوز 100 حرف");
             RuleFor(x => x.ClientName)
                 .NotEmpty().WithMessage("اسم العميل مطلوب")
                 .MaximumLength(200).WithMessage("اسم العميل يجب ألا يتجاوز 200 حرف");
         }
     }
 
     public class UpdateCaseValidator : AbstractValidator<UpdateCaseDto>
     {
         public UpdateCaseValidator()
         {
             RuleFor(x => x.Title)
                 .NotEmpty().WithMessage("عنوان القضية مطلوب")
                 .MaximumLength(200).WithMessage("عنوان القضية يجب ألا يتجاوز 200 حرف");
             RuleFor(x => x.Number)
                 .MaximumLength(200).WithMessage("رقم القضية يجب ألا يتجاوز 200 حرف");
             RuleFor(x => x.Court)
                 .MaximumLength(200).WithMessage("اسم المحكمة يجب ألا يتجاوز 200 حرف");
             RuleFor(x => x.ClientName)
                .NotEmpty().WithMessage("اسم العميل مطلوب");
        }
    }
}
