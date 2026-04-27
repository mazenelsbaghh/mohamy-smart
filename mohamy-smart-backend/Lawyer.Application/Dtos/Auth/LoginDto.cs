using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Dto.Auth
{
	public class LoginDto
	{
		public string PhoneNumber { get; set; } = string.Empty;	
		public string Password { get; set; } = string.Empty;
	}

	public class AdminLoginDto
	{
		public string Email { get; set; } = string.Empty;
		public string Password { get; set; } = string.Empty;
	}


}
