using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
    internal class InternalRegulationConfiguration : IEntityTypeConfiguration<InternalRegulation>
    {
        public void Configure(EntityTypeBuilder<InternalRegulation> builder)
        {
            builder.ToTable("InternalRegulations");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            builder.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(240);

            builder.Property(e => e.RegulationNumber)
                .HasMaxLength(120);

            builder.Property(e => e.IssuingAuthority)
                .HasMaxLength(240);

            builder.Property(e => e.Summary)
                .HasMaxLength(1000);

            builder.Property(e => e.Content)
                .IsRequired()
                .HasMaxLength(50000);

            builder.Property(e => e.CreatedAtUtc)
                .IsRequired();

            builder.HasIndex(e => e.LawyerId)
                .HasDatabaseName("IX_InternalRegulations_LawyerId");

            builder.HasIndex(e => new { e.LawyerId, e.IsActive })
                .HasDatabaseName("IX_InternalRegulations_LawyerId_IsActive");

            builder.HasIndex(e => new { e.LawyerId, e.Title })
                .HasDatabaseName("IX_InternalRegulations_LawyerId_Title");

            builder.HasOne(e => e.Lawyer)
                .WithMany()
                .HasForeignKey(e => e.LawyerId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
