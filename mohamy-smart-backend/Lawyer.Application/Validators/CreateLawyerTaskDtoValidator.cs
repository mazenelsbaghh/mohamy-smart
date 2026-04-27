using FluentValidation;
using Lawyer.Application.Dtos.LawyerTask;

namespace Lawyer.Application.Validators
{
    public class CreateLawyerTaskDtoValidator : AbstractValidator<CreateLawyerTaskDto>
    {
        public CreateLawyerTaskDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("عنوان المهمة مطلوب")
                .MaximumLength(200).WithMessage("عنوان المهمة يجب ألا يتجاوز 200 حرف");
            RuleFor(x => x.Notes)
                .MaximumLength(2000).WithMessage("الملاحظات يجب ألا تتجاوز 2000 حرف");
        }
    }
}
