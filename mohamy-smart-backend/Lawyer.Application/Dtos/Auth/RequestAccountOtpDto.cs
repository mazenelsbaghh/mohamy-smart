using System;

namespace Lawyer.Application.Dto.Auth
{
    public class RequestAccountOtpDto
    {
        public string Purpose { get; set; } = "change-password";
    }

    public class VerifyAccountOtpDto
    {
        public string Code { get; set; } = string.Empty;
        public string Purpose { get; set; } = "change-password";
    }
}
