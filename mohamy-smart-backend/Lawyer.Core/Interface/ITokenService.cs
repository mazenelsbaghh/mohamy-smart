using Lawyer.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Common.Interface
{
	public interface ITokenService
	{
		Task<string> CreateToken(ApplicationUser user, IList<string> roles);
		Task<string> GenerateRefreshToken();
	}
}
