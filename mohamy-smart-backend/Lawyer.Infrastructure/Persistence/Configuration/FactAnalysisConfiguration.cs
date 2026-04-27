using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
    internal class FactAnalysisConfiguration : IEntityTypeConfiguration<FactAnalysis>
    {
        public void Configure(EntityTypeBuilder<FactAnalysis> builder)
        {
            builder.ToTable("FactAnalyses");

            builder.HasKey(x => x.Id);

            builder.HasOne(x => x.Case)
                .WithMany(x => x.FactAnalyses)
                .HasForeignKey(x => x.CaseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.CaseId);

            // Composite index for queries filtering by CaseId and ordering by Created
            builder.HasIndex(x => new { x.CaseId, x.Created })
                .HasDatabaseName("IX_FactAnalyses_CaseId_Created");
        }
    }
}
