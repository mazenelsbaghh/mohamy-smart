using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
	internal class ClientConfiguration : IEntityTypeConfiguration<Client>
	{
		public void Configure(EntityTypeBuilder<Client> builder)
		{
			builder.ToTable("Clients");

			builder.HasKey(x => x.Id);

			builder.Property(x => x.ClientName)
				.IsRequired()
				.HasMaxLength(500);

			// Client -> Lawyer (many-to-one via Lawyer.Clients)
			builder.HasOne(x => x.Lawyer)
				.WithMany(x => x.Clients)
				.HasForeignKey(x => x.LawyerId)
				.OnDelete(DeleteBehavior.Restrict);

			// Client -> Cases (One-to-Many)
			builder.HasMany(x => x.Cases)
				.WithOne(c => c.Client)
				.HasForeignKey(c => c.ClientId)
				.OnDelete(DeleteBehavior.SetNull);

			builder.HasIndex(x => x.LawyerId);
		}
	}
}
