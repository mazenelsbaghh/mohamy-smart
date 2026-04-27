using FluentValidation;
using Lawyer.Application.Dtos.CaseType;

namespace Lawyer.Application.Validators
{
    public class CreateCaseTypeDtoValidator : AbstractValidator<CreateCaseTypeDto>
    {
        public CreateCaseTypeDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("عنوان نوع القضية مطلوب")
                .MaximumLength(100).WithMessage("عنوان نوع القضية يجب ألا يتجاوز 100 حرف");
        }
    }
}
