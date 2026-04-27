using Lawyer.Core.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
	internal class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
	{
		public void Configure(EntityTypeBuilder<ApplicationUser> builder)
		{
			builder.ToTable("Users");
			builder.HasQueryFilter(u => u.IsActive);
		}
	}

	internal class IdentityRoleConfiguration : IEntityTypeConfiguration<Role>
	{
		public void Configure(EntityTypeBuilder<Role> builder)
		{
			builder.ToTable("Roles");
		}
	}

	internal class IdentityUserRoleConfiguration : IEntityTypeConfiguration<IdentityUserRole<Guid>>
	{
		public void Configure(EntityTypeBuilder<IdentityUserRole<Guid>> builder)
		{
			builder.ToTable("UsersRoles");
			builder.HasKey(x => new { x.UserId, x.RoleId });
		}
	}

	internal class IdentityUserClaimConfiguration : IEntityTypeConfiguration<IdentityUserClaim<Guid>>
	{
		public void Configure(EntityTypeBuilder<IdentityUserClaim<Guid>> builder)
		{
			builder.ToTable("UserClaims");
			builder.HasKey(x => x.Id);
		}
	}

	internal class IdentityUserLoginConfiguration : IEntityTypeConfiguration<IdentityUserLogin<Guid>>
	{
		public void Configure(EntityTypeBuilder<IdentityUserLogin<Guid>> builder)
		{
			builder.ToTable("UserLogins");
			builder.HasKey(x => new { x.LoginProvider, x.ProviderKey });
		}
	}

	internal class IdentityUserTokenConfiguration : IEntityTypeConfiguration<IdentityUserToken<Guid>>
	{
		public void Configure(EntityTypeBuilder<IdentityUserToken<Guid>> builder)
		{
			builder.ToTable("UserTokens");
			builder.HasKey(x => new { x.UserId, x.LoginProvider, x.Name });
		}
	}

	internal class IdentityRoleClaimConfiguration : IEntityTypeConfiguration<IdentityRoleClaim<Guid>>
	{
		public void Configure(EntityTypeBuilder<IdentityRoleClaim<Guid>> builder)
		{
			builder.ToTable("RoleClaims");
			builder.HasKey(x => x.Id);
		}
	}
}
