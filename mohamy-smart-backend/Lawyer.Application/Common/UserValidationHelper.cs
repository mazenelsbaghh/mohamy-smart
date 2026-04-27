using Lawyer.Core.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Common
{
	public static class UserValidationHelper
	{
		/// <summary>
		/// Checks whether an email or phone number already exists in the user store.
		/// </summary>
		/// <param name="userManager">The UserManager instance.</param>
		/// <param name="email">The email to check.</param>
		/// <param name="phoneNumber">The phone number to check.</param>
		/// <param name="excludeUserId">Optional user ID to exclude (used in update scenarios).</param>
		/// <returns>Tuple indicating whether email or phone already exist.</returns>
		
			public static async Task<(bool EmailExists, bool PhoneExists)> EmailOrPhoneExistsAsync(
				UserManager<ApplicationUser> userManager,
				string email,
				string phoneNumber,
					string? excludeUserId = null)
			{
				var users = userManager.Users.AsQueryable();

				if (!string.IsNullOrEmpty(excludeUserId))
				{
					users = users.Where(u => u.Id != Guid.Parse(excludeUserId));
				}

				var emailExists = !string.IsNullOrWhiteSpace(email) &&
					await users.AnyAsync(u => u.Email == email && u.IsActive == true);

				var phoneExists = !string.IsNullOrWhiteSpace(phoneNumber) &&
					await users.AnyAsync(u => u.PhoneNumber == phoneNumber && u.IsActive == true);

				return (emailExists, phoneExists);
			}
		}

	}
