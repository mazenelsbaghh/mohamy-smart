using FluentValidation;
using Lawyer.Application.Dtos.Agenda;

namespace Lawyer.Application.Validators
{
    public class AgendaItemDtoValidator : AbstractValidator<AgendaItemDto>
    {
        public AgendaItemDtoValidator()
        {
            RuleFor(x => x.CaseId)
                .NotEmpty().WithMessage("معرف القضية مطلوب");
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("العنوان مطلوب")
                .MaximumLength(200).WithMessage("العنوان يجب ألا يتجاوز 200 حرف");
            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("التاريخ مطلوب");
            RuleFor(x => x.EndDate)
                .GreaterThan(x => x.Date)
                .When(x => x.EndDate.HasValue)
                .WithMessage("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("النوع مطلوب")
                .MaximumLength(50).WithMessage("النوع يجب ألا يتجاوز 50 حرف");
            RuleFor(x => x.CourtName)
                .MaximumLength(200).When(x => x.CourtName != null);
            RuleFor(x => x.PostponementReason)
                .MaximumLength(500).When(x => x.PostponementReason != null);
        }
    }
}
