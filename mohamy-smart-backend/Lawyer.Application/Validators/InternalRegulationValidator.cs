using FluentValidation;
using Lawyer.Application.Dtos.InternalRegulations;

namespace Lawyer.Application.Validators
{
    public class CreateInternalRegulationValidator : AbstractValidator<CreateInternalRegulationDto>
    {
        public CreateInternalRegulationValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("عنوان اللائحة الداخلية مطلوب")
                .MaximumLength(240).WithMessage("عنوان اللائحة الداخلية يجب ألا يتجاوز 240 حرف");

            RuleFor(x => x.RegulationNumber)
                .MaximumLength(120).WithMessage("رقم اللائحة يجب ألا يتجاوز 120 حرف");

            RuleFor(x => x.IssuingAuthority)
                .MaximumLength(240).WithMessage("جهة الإصدار يجب ألا تتجاوز 240 حرف");

            RuleFor(x => x.Summary)
                .MaximumLength(1000).WithMessage("ملخص اللائحة يجب ألا يتجاوز 1000 حرف");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("نص اللائحة الداخلية مطلوب");
        }
    }

    public class CreateInternalRegulationFromOcrValidator : AbstractValidator<CreateInternalRegulationFromOcrDto>
    {
        public CreateInternalRegulationFromOcrValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("عنوان اللائحة الداخلية مطلوب")
                .MaximumLength(240).WithMessage("عنوان اللائحة الداخلية يجب ألا يتجاوز 240 حرف");

            RuleFor(x => x.RegulationNumber)
                .MaximumLength(120).WithMessage("رقم اللائحة يجب ألا يتجاوز 120 حرف");

            RuleFor(x => x.IssuingAuthority)
                .MaximumLength(240).WithMessage("جهة الإصدار يجب ألا تتجاوز 240 حرف");

            RuleFor(x => x.Summary)
                .MaximumLength(1000).WithMessage("ملخص اللائحة يجب ألا يتجاوز 1000 حرف");

            RuleFor(x => x.Files)
                .NotEmpty().WithMessage("ارفع ملف PDF أو صورة للائحة الداخلية أولًا");
        }
    }

    public class UpdateInternalRegulationValidator : AbstractValidator<UpdateInternalRegulationDto>
    {
        public UpdateInternalRegulationValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("عنوان اللائحة الداخلية مطلوب")
                .MaximumLength(240).WithMessage("عنوان اللائحة الداخلية يجب ألا يتجاوز 240 حرف");

            RuleFor(x => x.RegulationNumber)
                .MaximumLength(120).WithMessage("رقم اللائحة يجب ألا يتجاوز 120 حرف");

            RuleFor(x => x.IssuingAuthority)
                .MaximumLength(240).WithMessage("جهة الإصدار يجب ألا تتجاوز 240 حرف");

            RuleFor(x => x.Summary)
                .MaximumLength(1000).WithMessage("ملخص اللائحة يجب ألا يتجاوز 1000 حرف");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("نص اللائحة الداخلية مطلوب");
        }
    }

    public class UpdateCaseInternalRegulationsValidator : AbstractValidator<UpdateCaseInternalRegulationsDto>
    {
        public UpdateCaseInternalRegulationsValidator()
        {
            RuleForEach(x => x.InternalRegulationIds)
                .NotEmpty().WithMessage("معرف اللائحة الداخلية غير صالح");
        }
    }
}
