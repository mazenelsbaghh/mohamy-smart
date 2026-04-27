using Lawyer.Core.Enums;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Core.IRepositories
{
	public interface IUserRepository : IGenericRepository<ApplicationUser>
	{


		Task<bool> UserExistsByPhoneNumberAsync(string phoneNumber);
		Task<Result<string>> LogoutAsync(string userId);
		Task MarkUserAsVerifiedByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default);
		Task<bool> ValidateOtpAsync(string phoneNumber, string otpCode , OtpType type , CancellationToken cancellationToken = default);
	}
}
