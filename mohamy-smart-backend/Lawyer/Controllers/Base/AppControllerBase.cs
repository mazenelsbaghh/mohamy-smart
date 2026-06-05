using Microsoft.AspNetCore.Mvc;
using Lawyer.Core.Exceptions;
using System;
using System.Net;
using System.Security.Claims;

namespace Lawyer.Controllers.Base
{
	[ApiController]
	public abstract class AppControllerBase : ControllerBase
	{
		protected Guid GetUserId()
		{
			var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
				throw new UnauthorizedAccessException("يرجى تسجيل الدخول.");
			return userId;
		}

		protected ObjectResult CreateResponse<T>(Result<T> response) 
		{
			return response.StatusCode switch
			{
				HttpStatusCode.OK => Ok(response),
				HttpStatusCode.Created => Created(string.Empty, response),
				HttpStatusCode.Unauthorized => Unauthorized(response),
				HttpStatusCode.Forbidden => StatusCode((int)HttpStatusCode.Forbidden, response),
				HttpStatusCode.BadRequest => BadRequest(response),
				HttpStatusCode.NotFound => NotFound(response),
				HttpStatusCode.Accepted => Accepted(response),
				HttpStatusCode.UnprocessableEntity => UnprocessableEntity(response),
				HttpStatusCode.Conflict => Conflict(response),
				HttpStatusCode.NotImplemented => StatusCode((int)HttpStatusCode.NotImplemented, response),
				HttpStatusCode.InternalServerError => StatusCode((int)HttpStatusCode.InternalServerError, response),
				_ => BadRequest(response),
			};
		}

		// T004: Write session + refresh httpOnly cookies on successful auth.
		// Production uses the __Host- prefix (browser-enforced: Secure=true + Path=/ + no Domain).
		// Dev omits the prefix so the cookie works over plain HTTP on localhost.
		protected void SetAuthCookies(HttpResponse response, string accessToken, string refreshToken, bool isProduction)
		{
			var prefix = isProduction ? "__Host-" : "";

			response.Cookies.Append($"{prefix}session", accessToken, new CookieOptions
			{
				HttpOnly  = true,
				Secure    = isProduction,
				SameSite  = SameSiteMode.Lax,
				Path      = "/",
				MaxAge    = TimeSpan.FromDays(1)       // matches JWT DurationInMinutes
			});

			if (!string.IsNullOrEmpty(refreshToken))
			{
				response.Cookies.Append($"{prefix}refresh", refreshToken, new CookieOptions
				{
					HttpOnly  = true,
					Secure    = isProduction,
					SameSite  = SameSiteMode.Lax,
					Path      = "/api/v1/Auth/",        // least-privilege — only sent to /api/v1/Auth/* endpoints
					MaxAge    = TimeSpan.FromDays(7)    // matches RefreshTokenExpiresAt
				});
			}
		}

		// T005: Expire all three auth cookies (session, refresh, XSRF-TOKEN) on logout / refresh revocation.
		protected void ClearAuthCookies(HttpResponse response, bool isProduction)
		{
			var prefix = isProduction ? "__Host-" : "";

			response.Cookies.Append($"{prefix}session",  "", new CookieOptions { MaxAge = TimeSpan.Zero, Path = "/", Secure = isProduction, SameSite = SameSiteMode.Lax });
			response.Cookies.Append($"{prefix}refresh",  "", new CookieOptions { MaxAge = TimeSpan.Zero, Path = "/api/v1/Auth/", Secure = isProduction, SameSite = SameSiteMode.Lax });
			response.Cookies.Append("XSRF-TOKEN",        "", new CookieOptions { MaxAge = TimeSpan.Zero, Path = "/", Secure = isProduction, SameSite = SameSiteMode.Lax });
		}
	}
}
