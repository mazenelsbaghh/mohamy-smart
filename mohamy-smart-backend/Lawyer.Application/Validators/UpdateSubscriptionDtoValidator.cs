using FluentValidation;
using Lawyer.Application.Dtos;

namespace Lawyer.Application.Validators
{
	public class UpdateSubscriptionDtoValidator : AbstractValidator<UpdateSubscriptionDto>
	{
		public UpdateSubscriptionDtoValidator()
		{
			When(x => x.Price.HasValue, () =>
			{
				RuleFor(x => x.Price)
					.GreaterThanOrEqualTo(0).WithMessage("Price must be greater than or equal to zero.");
			});

			When(x => x.Name != null, () =>
			{
				RuleFor(x => x.Name)
					.NotEmpty().WithMessage("Plan name cannot be empty.")
					.MaximumLength(100).WithMessage("Plan name must not exceed 100 characters.");
			});

			When(x => x.DurationDays.HasValue, () =>
			{
				RuleFor(x => x.DurationDays)
					.GreaterThanOrEqualTo(0).WithMessage("Duration days must be greater than or equal to zero.");
			});

			When(x => x.AiRequestsLimit.HasValue, () =>
			{
				RuleFor(x => x.AiRequestsLimit)
					.GreaterThanOrEqualTo(0).WithMessage("AI requests limit must be greater than or equal to zero.");
			});
		}
	}
}
