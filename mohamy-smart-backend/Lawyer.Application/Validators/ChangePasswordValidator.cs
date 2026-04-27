using FluentValidation;
using Lawyer.Application.Dtos.Account;

namespace Lawyer.Application.Validators
{
    public class ChangePasswordValidator : AbstractValidator<ChangePasswordDto>
    {
        public ChangePasswordValidator()
        {
            RuleFor(x => x.CurrentPassword)
                .NotEmpty().WithMessage("كلمة المرور الحالية مطلوبة");
            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("كلمة المرور الجديدة مطلوبة")
                .MinimumLength(8).WithMessage("كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل")
                .Matches(@"[A-Z]").WithMessage("كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل")
                .Matches(@"[a-z]").WithMessage("كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل")
                .Matches(@"[0-9]").WithMessage("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل")
                .Matches(@"[\W_]").WithMessage("كلمة المرور يجب أن تحتوي على حرف خاص واحد على الأقل");
            RuleFor(x => x.ConfirmPassword)
                .Equal(x => x.NewPassword).WithMessage("تأكيد كلمة المرور غير متطابق");
            RuleFor(x => x.OtpCode)
                .NotEmpty().WithMessage("رمز التحقق مطلوب");
        }
    }
}
