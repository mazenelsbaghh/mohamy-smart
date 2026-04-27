using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
    internal class DefenseConfiguration : IEntityTypeConfiguration<Defense>
    {
        public void Configure(EntityTypeBuilder<Defense> builder)
        {
            builder.ToTable("Defenses");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.DefenseTitle)
                .HasMaxLength(1000)
                .IsRequired();

            builder.Property(x => x.BasisFromCase)
                .HasMaxLength(2000);

            builder.Property(x => x.Scope)
                .HasMaxLength(100);

            builder.Property(x => x.Type)
                .IsRequired();

            builder.Property(x => x.Strength)
                .IsRequired();

            builder.Property(x => x.AnalysisJson)
                .HasColumnType("nvarchar(max)");

            builder.HasOne(x => x.Case)
                .WithMany(x => x.Defenses)
                .HasForeignKey(x => x.CaseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.CaseId);
            builder.HasIndex(x => x.Type);

            // Composite index for queries filtering by CaseId + Type
            builder.HasIndex(x => new { x.CaseId, x.Type })
                .HasDatabaseName("IX_Defenses_CaseId_Type");

            // Composite index for queries filtering by CaseId and ordering by Created
            builder.HasIndex(x => new { x.CaseId, x.Created })
                .HasDatabaseName("IX_Defenses_CaseId_Created");
        }
    }
}
