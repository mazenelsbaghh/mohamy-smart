using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
    internal class ProcessServerPaperConfiguration : IEntityTypeConfiguration<ProcessServerPaper>
    {
        public void Configure(EntityTypeBuilder<ProcessServerPaper> builder)
        {
            builder.ToTable("ProcessServerPapers");

            builder.HasIndex(e => e.LawyerId)
                .HasDatabaseName("IX_ProcessServerPapers_LawyerId");

            builder.HasIndex(e => e.ClientId)
                .HasDatabaseName("IX_ProcessServerPapers_ClientId");
                
            builder.HasIndex(e => e.CaseId)
                .HasDatabaseName("IX_ProcessServerPapers_CaseId");
        }
    }
}
