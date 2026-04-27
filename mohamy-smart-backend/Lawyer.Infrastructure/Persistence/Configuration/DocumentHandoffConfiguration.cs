using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
    internal class DocumentHandoffConfiguration : IEntityTypeConfiguration<DocumentHandoff>
    {
        public void Configure(EntityTypeBuilder<DocumentHandoff> builder)
        {
            builder.ToTable("DocumentHandoffs");

            builder.HasIndex(e => e.ClientId)
                .HasDatabaseName("IX_DocumentHandoffs_ClientId");
        }
    }
}
