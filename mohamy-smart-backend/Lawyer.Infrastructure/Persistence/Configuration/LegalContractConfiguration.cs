using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
    internal class LegalContractConfiguration : IEntityTypeConfiguration<LegalContract>
    {
        public void Configure(EntityTypeBuilder<LegalContract> builder)
        {
            builder.ToTable("LegalContracts");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            builder.Property(e => e.ContractTypeCode)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(e => e.ContractTypeName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(e => e.InputDetails)
                .IsRequired()
                .HasMaxLength(5000);

            builder.Property(e => e.CustomClauses)
                .HasMaxLength(3000);

            builder.Property(e => e.GeneratedContent)
                .HasMaxLength(50000);

            builder.Property(e => e.LastErrorMessage)
                .HasMaxLength(2000);

            builder.Property(e => e.ModelIdentifier)
                .HasMaxLength(100);

            builder.Property(e => e.Status)
                .IsRequired();

            builder.Property(e => e.AiStepType)
                .IsRequired();

            builder.Property(e => e.CreatedAtUtc)
                .IsRequired();

            // Indexes (mirrors entity-level [Index] attributes — explicit here for clarity)
            builder.HasIndex(e => e.LawyerId)
                .HasDatabaseName("IX_LegalContracts_LawyerId");

            builder.HasIndex(e => e.ClientId)
                .HasDatabaseName("IX_LegalContracts_ClientId");

            builder.HasIndex(e => e.CreatedAtUtc)
                .HasDatabaseName("IX_LegalContracts_CreatedAtUtc");

            // Relationships
            builder.HasOne(e => e.Lawyer)
                .WithMany()
                .HasForeignKey(e => e.LawyerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
