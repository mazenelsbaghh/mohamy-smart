using System;
using System.Security.Claims;
using Lawyer.Application.Common;
using Microsoft.AspNetCore.Http;

namespace Lawyer.Services
{
    public class HttpUserContextProvider : IUserContextProvider
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public HttpUserContextProvider(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public UserContext GetCurrentContext()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            var userIdClaim = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = Guid.TryParse(userIdClaim, out var id) ? id : Guid.Empty;

            return new UserContext
            {
                UserId = userId,
                IsAdmin = user?.IsInRole("Admin") ?? false,
                IsLawyer = user?.IsInRole("Lawyer") ?? false,
                ClientIp = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString()
            };
        }
    }
}
