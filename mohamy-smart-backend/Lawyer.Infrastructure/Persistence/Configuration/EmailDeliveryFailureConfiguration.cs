using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
    public class EmailDeliveryFailureConfiguration : IEntityTypeConfiguration<EmailDeliveryFailure>
    {
        public void Configure(EntityTypeBuilder<EmailDeliveryFailure> builder)
        {
            builder.ToTable("EmailDeliveryFailures");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.EventType)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(e => e.RelatedBusinessId)
                .IsRequired()
                .HasMaxLength(256);

            builder.Property(e => e.RecipientAddress)
                .IsRequired()
                .HasMaxLength(320);

            builder.Property(e => e.FailureReason)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(e => e.RetryState)
                .IsRequired()
                .HasMaxLength(30)
                .HasDefaultValue("not_attempted");

            builder.Property(e => e.FailedAt)
                .IsRequired();

            builder.HasIndex(e => e.EventType);
            builder.HasIndex(e => e.FailedAt);
        }
    }
}
