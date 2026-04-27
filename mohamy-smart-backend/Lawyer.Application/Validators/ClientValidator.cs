using FluentValidation;
using Lawyer.Application.Common;
using Lawyer.Application.Dtos.Client;

namespace Lawyer.Application.Validators
{
    public class CreateClientValidator : AbstractValidator<CreateClientDto>
    {
        public CreateClientValidator()
        {
            RuleFor(x => x.ClientName)
                .NotEmpty().WithMessage("اسم العميل مطلوب")
                .MaximumLength(200).WithMessage("اسم العميل يجب ألا يتجاوز 200 حرف");
            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("رقم الهاتف مطلوب")
                .Must(CustomValidators.BeAValidEgyptianPhoneNumber).WithMessage("صيغة رقم الهاتف غير صحيحة");
            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("صيغة البريد الإلكتروني غير صحيحة")
                .When(x => !string.IsNullOrEmpty(x.Email));
            RuleFor(x => x.NationalId)
                .MaximumLength(20).WithMessage("الرقم القومي يجب ألا يتجاوز 20 حرف")
                .When(x => !string.IsNullOrEmpty(x.NationalId));
        }
    }

    public class UpdateClientValidator : AbstractValidator<UpdateClientDto>
    {
        public UpdateClientValidator()
        {
            RuleFor(x => x.ClientName)
                .NotEmpty().WithMessage("اسم العميل مطلوب");
            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("رقم الهاتف مطلوب")
                .Must(CustomValidators.BeAValidEgyptianPhoneNumber).WithMessage("صيغة رقم الهاتف غير صحيحة");
            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("صيغة البريد الإلكتروني غير صحيحة")
                .When(x => !string.IsNullOrEmpty(x.Email));
            RuleFor(x => x.NationalId)
                .Must(CustomValidators.BeAValidEgyptianNationalId).WithMessage("صيغة الرقم القومي غير صحيحة")
                .When(x => !string.IsNullOrEmpty(x.NationalId));
        }
    }
}
