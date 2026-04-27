using System;
using System.Security.Claims;

namespace Lawyer.Application.Common
{
	public static class UserContextHelper
	{
		public static string? GetUserId(ClaimsPrincipal user)
		{
			return user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
		}

		public static string? GetUserName(ClaimsPrincipal user)
		{
			return user?.FindFirst(ClaimTypes.Name)?.Value;
		}

		public static string? GetUserEmail(ClaimsPrincipal user)
		{
			return user?.FindFirst(ClaimTypes.Email)?.Value;
		}

		public static bool IsInRole(ClaimsPrincipal user, string role)
		{
			return user?.IsInRole(role) ?? false;
		}
	}
}
