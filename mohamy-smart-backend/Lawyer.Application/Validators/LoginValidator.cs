using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;
using Lawyer.Application.Common;
using Lawyer.Application.Dto.Auth;

namespace Lawyer.Application.Validators
{
    public class LoginValidator : AbstractValidator<LoginDto>
    {
        public LoginValidator()
        {
            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("رقم الهاتف مطلوب.");
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("كلمة المرور مطلوبة.");
        }
    }

    public class AdminLoginValidator : AbstractValidator<AdminLoginDto>
    {
        public AdminLoginValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("البريد الإلكتروني مطلوب.")
                .EmailAddress().WithMessage("صيغة البريد الإلكتروني غير صحيحة.");
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("كلمة المرور مطلوبة.");
        }
    }
}
