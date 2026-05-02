using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
    internal class CaseInternalRegulationConfiguration : IEntityTypeConfiguration<CaseInternalRegulation>
    {
        public void Configure(EntityTypeBuilder<CaseInternalRegulation> builder)
        {
            builder.ToTable("CaseInternalRegulations");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            builder.Property(e => e.CreatedAtUtc)
                .IsRequired();

            builder.HasIndex(e => new { e.CaseId, e.InternalRegulationId })
                .IsUnique()
                .HasDatabaseName("UX_CaseInternalRegulations_Case_Regulation");

            builder.HasIndex(e => e.InternalRegulationId)
                .HasDatabaseName("IX_CaseInternalRegulations_InternalRegulationId");

            builder.HasOne(e => e.Case)
                .WithMany(e => e.CaseInternalRegulations)
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.InternalRegulation)
                .WithMany(e => e.CaseLinks)
                .HasForeignKey(e => e.InternalRegulationId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
