using Lawyer.Core.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Core.Models
{
	public class ApplicationUser : IdentityUser<Guid>
	{
		public string FullName { get; set; } = string.Empty;

		public bool IsActive { get; set; } = true;

		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		public string? RefreshToken { get; set; } = null!;
		public DateTime? RefreshTokenExpiresAt { get; set; }
		public UserType UserType { get; set; }

		public string? Governorate { get; set; }
		public bool AgreedToTerms { get; set; }

		public Lawyer? Lawyer { get; set; }
		public ICollection<IdentityUserRole<Guid>> UserRoles { get; set; } = new List<IdentityUserRole<Guid>>();

		public ICollection<Role> Roles { get; set; } = new List<Role>();


		


	}
}
