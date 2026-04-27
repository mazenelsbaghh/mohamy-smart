using System;

namespace Lawyer.Application.Dtos.Account
{
    public class ProfileDto
    {
        public Guid LawyerId { get; set; }
        public string ApplicationUserId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string OfficeName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }

    public class UpdateProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string OfficeName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }

    public class LawyerChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
