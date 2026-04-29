using FluentValidation;
using Lawyer.Application.IServices;

namespace Lawyer.Application.Validators
{
    public class CreateClientTransactionValidator : AbstractValidator<CreateClientTransactionDto>
    {
        public CreateClientTransactionValidator()
        {
            RuleFor(x => x.ClientId)
                .NotEmpty().WithMessage("معرف العميل مطلوب");
            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("نوع المعاملة مطلوب")
                .Must(t => t == "Income" || t == "Expense").WithMessage("نوع المعاملة يجب أن يكون 'Income' أو 'Expense'");
            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("المبلغ يجب أن يكون أكبر من صفر");
            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("الوصف مطلوب")
                .MaximumLength(500).WithMessage("الوصف يجب ألا يتجاوز 500 حرف");
        }
    }
}
