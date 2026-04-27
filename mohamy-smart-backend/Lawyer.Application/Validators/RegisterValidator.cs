using FluentValidation;
using Lawyer.Application.Common;
using Lawyer.Application.Dto.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Validators
{
    public class RegisterValidator : AbstractValidator<RegisterDto>
    {
        public RegisterValidator()
        {
            RuleFor(x => x.FullName)
                   .NotEmpty().WithMessage("FullName is required.")
                   .MinimumLength(2).WithMessage("Full name must be at least 2 characters.")
                   .MaximumLength(100).WithMessage("Full name must not exceed 100 characters.")
                   .Matches(@"^[\p{L}\s]{2,100}$")
                   .WithMessage("Full name must contain only letters and spaces.");

			RuleFor(x => x.Password)
				.NotEmpty().WithMessage("Password is required.")
				.MinimumLength(6).WithMessage("Password must be at least 6 characters long.")
				.Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
				.Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
				.Matches(@"[0-9]").WithMessage("Password must contain at least one digit.")
				.Matches(@"[\W_]").WithMessage("Password must contain at least one special character.");

			RuleFor(x => x.PasswordConfirmation)
				.NotEmpty().WithMessage("Password confirmation is required.")
				.Equal(x => x.Password).WithMessage("Passwords do not match.");

			RuleFor(x => x.PhoneNumber)
									  .NotEmpty().WithMessage("Phone number is required.")
									  .Must(CustomValidators.BeAValidEgyptianPhoneNumber).WithMessage("Invalid Egyptian phone number.");

			RuleFor(x => x.Email)
				.NotEmpty().WithMessage("Email is required.")
				.EmailAddress().WithMessage("Invalid email format.");

			RuleFor(x => x.Governorate)
				.NotEmpty().WithMessage("Governorate is required.")
				.MaximumLength(50).WithMessage("Governorate must not exceed 50 characters.");

			RuleFor(x => x.AgreeToTerms)
				.Equal(true).WithMessage("You must agree to the terms and conditions.");
		}
    }

}
