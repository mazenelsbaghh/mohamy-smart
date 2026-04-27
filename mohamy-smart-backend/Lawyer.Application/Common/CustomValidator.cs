using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Lawyer.Application.Common
{
	public static class CustomValidators
	{
		public static bool BeAValidSaudiPhoneNumber(string phoneNumber)
		{
			if (string.IsNullOrEmpty(phoneNumber))
				return false;

			return Regex.IsMatch(phoneNumber, @"^(?:\+966|966)?5\d{8}$"); // update this to put 0 before 5  
		}

		public static bool BeAValidEgyptianPhoneNumber(string phoneNumber)
		{
			if (string.IsNullOrEmpty(phoneNumber))
				return false;

			// نمط للتحقق من الأرقام المصرية (مثلاً 01012345678 أو +201012345678)
			return Regex.IsMatch(phoneNumber, @"^(?:\+20|0020|0)?1[0125]\d{8}$");
		}


		public static bool BeAValidSaudiNationalId(string nationalId)
		{
			if (string.IsNullOrEmpty(nationalId))
				return false;

			return Regex.IsMatch(nationalId, @"^[12]\d{9}$");
		}

		public static bool BeAValidEgyptianNationalId(string? nationalId)
		{
			if (string.IsNullOrEmpty(nationalId))
				return false;

			return Regex.IsMatch(nationalId, @"^[23]\d{13}$");
		}
	}

}
