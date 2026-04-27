using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
    internal class CaseConfiguration : IEntityTypeConfiguration<Case>
    {
        public void Configure(EntityTypeBuilder<Case> builder)
        {
            builder.ToTable("Cases");

            // Index for filtering cases by lawyer (most common query pattern)
            builder.HasIndex(c => c.LawyerId)
                .HasDatabaseName("IX_Cases_LawyerId");

            // Composite index for lawyer + status filtering (dashboard queries)
            builder.HasIndex(c => new { c.LawyerId, c.Status })
                .HasDatabaseName("IX_Cases_LawyerId_Status");
        }
    }
}
