using Lawyer.Application.Common.Interface;
using Lawyer.Core.Enums;
using Lawyer.Core.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Infrastructure.Persistence
{
	public class DataSeed
	{
		public static async Task SeedBaselineAsync(
			RoleManager<Role> roleManager,
			UserManager<ApplicationUser> userManager,
			IConfiguration configuration,
			ILogger<DataSeed> logger)
		{
			var roles = new[] { "Admin", "Lawyer" };
			foreach (var role in roles)
			{
				if (!await roleManager.RoleExistsAsync(role))
				{
					await roleManager.CreateAsync(new Role { Name = role });
				}
			}

			var adminEmail = configuration["SEED_ADMIN_EMAIL"];
			var adminPassword = configuration["SEED_ADMIN_PASSWORD"];


			if (!string.IsNullOrEmpty(adminEmail) && !string.IsNullOrEmpty(adminPassword))
			{
				await EnsureUserAsync(userManager, adminEmail, adminPassword, "Admin User", "Admin", null);
				logger.LogInformation("Seeded admin user: {Email}", adminEmail);
			}
			else
			{
				logger.LogWarning("Seed credentials not configured (SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD). Skipping admin seeding.");
			}
		}

		private static async Task EnsureUserAsync(UserManager<ApplicationUser> userManager, string email, string password, string fullName, string role, string? phoneNumber = null)
		{
			var user = await userManager.FindByEmailAsync(email);
			if (user == null)
			{
				var newUser = new ApplicationUser
				{
					Id = Guid.NewGuid(),
					UserName = email,
					Email = email,
					FullName = fullName,
					PhoneNumber = phoneNumber,
					IsActive = true,
					UserType = role == "Admin" ? UserType.Admin : UserType.Lawyer
				};

				var result = await userManager.CreateAsync(newUser, password);
				if (!result.Succeeded)
				{
					var errors = string.Join(", ", result.Errors.Select(e => e.Description));
					throw new Exception($"Failed to create seed user {email}: {errors}");
				}
				
				user = newUser;
			}
			else if (phoneNumber != null && user.PhoneNumber == null)
			{
				// repair: backfill missing phone on existing seed user
				user.PhoneNumber = phoneNumber;
				await userManager.UpdateAsync(user);
			}

			var expectedUserType = role == "Admin" ? UserType.Admin : UserType.Lawyer;
			if (user.UserType != expectedUserType)
			{
				user.UserType = expectedUserType;
				await userManager.UpdateAsync(user);
			}

			if (user != null && !await userManager.IsInRoleAsync(user, role))
			{
				var result = await userManager.AddToRoleAsync(user, role);
				if (!result.Succeeded)
				{
					throw new Exception($"Failed to add seed user {email} to role {role}");
				}
			}
		}
	}

}
