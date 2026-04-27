using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
    internal class ClientFileConfiguration : IEntityTypeConfiguration<ClientFile>
    {
        public void Configure(EntityTypeBuilder<ClientFile> builder)
        {
            builder.ToTable("ClientFiles");

            builder.HasIndex(e => e.ClientId)
                .HasDatabaseName("IX_ClientFiles_ClientId");
        }
    }
}
