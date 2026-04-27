using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
	internal class LawyerTaskConfiguration : IEntityTypeConfiguration<LawyerTask>
	{
		public void Configure(EntityTypeBuilder<LawyerTask> builder)
		{
			builder.ToTable("LawyerTasks");

			builder.HasKey(x => x.Id);

			builder.Property(x => x.Title)
				.IsRequired()
				.HasMaxLength(500);

			builder.Property(x => x.Notes)
				.HasMaxLength(2000);

			builder.HasOne(x => x.Lawyer)
				.WithMany()
				.HasForeignKey(x => x.LawyerId)
				.OnDelete(DeleteBehavior.Cascade);

			builder.HasIndex(x => x.LawyerId);
			builder.HasIndex(x => x.Date);
		}
	}
}
