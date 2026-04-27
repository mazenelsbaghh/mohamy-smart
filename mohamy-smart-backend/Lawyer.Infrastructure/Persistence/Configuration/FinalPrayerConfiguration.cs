using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
    internal class FinalPrayerConfiguration : IEntityTypeConfiguration<FinalPrayer>
    {
        public void Configure(EntityTypeBuilder<FinalPrayer> builder)
        {
            builder.ToTable("FinalPrayers");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.RequestText)
                .HasMaxLength(2000)
                .IsRequired();

            builder.Property(x => x.Level)
                .IsRequired();

            builder.Property(x => x.DisplayOrder)
                .IsRequired();

            builder.HasOne(x => x.Case)
                .WithMany(x => x.FinalPrayers)
                .HasForeignKey(x => x.CaseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.CaseId);
            builder.HasIndex(x => x.Level);

            // Composite index for queries filtering by CaseId and ordering by Created
            builder.HasIndex(x => new { x.CaseId, x.Created })
                .HasDatabaseName("IX_FinalPrayers_CaseId_Created");
        }
    }
}
