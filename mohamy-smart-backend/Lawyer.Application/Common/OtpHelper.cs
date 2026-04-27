using System.Security.Cryptography;
using System.Text;

namespace Lawyer.Application.Common
{
    public static class OtpHelper
    {
        public static string GenerateOtpCode()
        {
            return RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        }

        public static string GenerateSalt()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));
        }

        public static string HashOtpCode(string code, string salt)
        {
            var saltedBytes = Encoding.UTF8.GetBytes(salt + code);
            var hash = SHA256.HashData(saltedBytes);
            return Convert.ToHexString(hash);
        }

        public static bool MatchesOtp(string plainTextCode, string storedHash, string salt)
        {
            return HashOtpCode(plainTextCode, salt) == storedHash;
        }
    }
}
