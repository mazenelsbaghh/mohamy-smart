using Lawyer.Core.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Dtos.Account
{
	public class UserToReturnDto
	{
		public Guid Id { get; set; }
		public string? FullName { get; set; }
		public string? Email { get; set; }
		public string? PhoneNumber { get; set; }
		public bool IsActive { get; set; }
		public UserType UserType { get; set; }

		public string? BarNumber { get; set; }
		public string? Specialization { get; set; }
		public string? ExperienceNumber { get; set; }
		public string? LawFirmName { get; set; }
		public string? BirthDate { get; set; }
		
		public Guid? LawyerId { get; set; }
		public DateTime? LawyerCreatedAt { get; set; }

		// Subscription info
		public string? SubscriptionPlanName { get; set; }
		public bool? SubscriptionIsActive { get; set; }

		// Cases count
		public int NumberOfCases { get; set; }
	}

	public class ChangePasswordDto
	{
		public string CurrentPassword { get; set; } = null!;
		public string NewPassword { get; set; } = null!;
		public string ConfirmPassword { get; set; } = null!;
		public string OtpCode { get; set; } = string.Empty;
	}

	public class UpdateUserDto
	{
		public string? FullName { get; set; }
		public string? PhoneNumber { get; set; }
		public string? Email { get; set; }
		public string? BarNumber { get; set; }
		public string? Specialization { get; set; }
		public string? ExperienceNumber { get; set; }
		public string? LawFirmName { get; set; }
		public string? BirthDate { get; set; }
		public bool? IsActive { get; set; }
	}

}
