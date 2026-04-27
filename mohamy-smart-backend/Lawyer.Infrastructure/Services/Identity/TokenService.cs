using Lawyer.Application.Common.Interface;
using Lawyer.Core.Models;
using Lawyer.Core.Setting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Infrastructure.Services.Identity
{
	public class TokenService : ITokenService
	{
		private readonly JWT _tokenSettings;

		public TokenService(IOptions<JWT> options)
		{
			_tokenSettings = options.Value;
		}

		public Task<string> CreateToken(ApplicationUser user, IList<string> roles)
		{
			var jti = Guid.NewGuid().ToString();
			var userName = user.UserName ?? user.Email ?? user.PhoneNumber ?? user.Id.ToString();

			var authClaims = new List<Claim>
			{
				new(ClaimTypes.NameIdentifier, user.Id.ToString()),
				new(ClaimTypes.Name, userName),
				new(ClaimTypes.GivenName, user.FullName ?? ""),
				new(ClaimTypes.Email, user.Email ?? ""),
				new(JwtRegisteredClaimNames.Jti, jti)
			};

			if (user.Lawyer is not null)
			{
				authClaims.Add(new Claim("profile_id", user.Lawyer.Id.ToString()));
			}

			foreach (var role in roles)
			{
				authClaims.Add(new Claim(ClaimTypes.Role, role));
			}

			var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_tokenSettings.Key));
			var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

			var token = new JwtSecurityToken(
				issuer: _tokenSettings.Issuer,
				audience: _tokenSettings.Audience,
				expires: DateTime.UtcNow.AddMinutes(_tokenSettings.DurationInMinutes),
				claims: authClaims,
				signingCredentials: creds);

			return Task.FromResult(new JwtSecurityTokenHandler().WriteToken(token));
		}

		public Task<string> GenerateRefreshToken()
		{
			var randomBytes = RandomNumberGenerator.GetBytes(64);
			return Task.FromResult(Convert.ToBase64String(randomBytes));
		}


	}
}
