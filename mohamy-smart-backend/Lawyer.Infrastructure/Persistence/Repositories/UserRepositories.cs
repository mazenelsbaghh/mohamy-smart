using Lawyer.Application.Common.Interface;
using Lawyer.Core.Enums;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Infrastructure.Persistence.Repositories
{
	public class UserRepositories : GenericRepository<ApplicationUser>,IUserRepository
	{
		private readonly AppDbContext _appDbContext;
		private readonly UserManager<ApplicationUser> _userManager;
		private readonly IUnitOfWork _unitOfWork;

		public UserRepositories(AppDbContext context, UserManager<ApplicationUser> userManager, IUnitOfWork unitOfWork) : base(context)
		{
			_appDbContext = context;
			_userManager = userManager;
			_unitOfWork = unitOfWork;
		}


		public async Task<bool> UserExistsByPhoneNumberAsync(string phoneNumber)
		{
			return await _appDbContext.Users.AnyAsync(u => u.PhoneNumber == phoneNumber);
		}




		public Task<bool> ValidateOtpAsync(string phonenumber, string otpCode , OtpType type, CancellationToken cancellationToken = default)
		{
			if (string.IsNullOrWhiteSpace(phonenumber) || string.IsNullOrWhiteSpace(otpCode))
				return Task.FromResult(false);


			
			if (otpCode != "1234")
				return Task.FromResult(false);

			//var userOtp = await _context.Otps
			//	.AsNoTracking()
			//	.FirstOrDefaultAsync(x =>
			//		x.UserId.ToString() == userId &&
			//		x.Code == otpCode && x.OtpType =type
			//		x.ExpirationDate >= DateTime.UtcNow);

			//return userOtp != null;

			return Task.FromResult(true);
		}

		public async Task MarkUserAsVerifiedByPhoneNumberAsync(string phoneNumber , CancellationToken cancellationToken= default)
		{
			var user = await _userManager.Users.SingleOrDefaultAsync(x => x.PhoneNumber == phoneNumber);
			if (user != null)
			{
				user.IsActive = true;
				user.PhoneNumberConfirmed = true;
				var result = await _userManager.UpdateAsync(user);

				if (!result.Succeeded)
				{
					throw new Exception("Failed to update user verification status.");
				}
			}
			else
			{
				throw new Exception("User not found.");
			}


		}



		public async Task<Result<string>> LogoutAsync(string userId)
		{
			var user = await _appDbContext.Users.FindAsync(userId);
			if (user == null)
			{
				return Result<string>.Error(System.Net.HttpStatusCode.BadRequest,"User not found.");
			}

			
			user.RefreshToken = null;
			await _appDbContext.SaveChangesAsync();

			return Result<string>.Success("Successfully logged out.");
		}


	}
}
