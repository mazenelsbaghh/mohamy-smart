using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
    internal class AiStageModelConfigConfiguration : IEntityTypeConfiguration<AiStageModelConfig>
    {
        public void Configure(EntityTypeBuilder<AiStageModelConfig> builder)
        {
            builder.ToTable("AiStageModelConfigs");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            builder.HasIndex(e => e.StepType)
                .IsUnique();

            builder.Property(e => e.ModelIdentifier)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(e => e.UpdatedAt)
                .IsRequired();

            builder.Property(e => e.UpdatedBy)
                .HasMaxLength(100);

            builder.HasData(
                new AiStageModelConfig { Id = 1, StepType = AiStepType.FactAnalysis, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new AiStageModelConfig { Id = 2, StepType = AiStepType.GenerateDefenses, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new AiStageModelConfig { Id = 3, StepType = AiStepType.AnalysisDefense, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new AiStageModelConfig { Id = 4, StepType = AiStepType.FinalRequirements, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new AiStageModelConfig { Id = 5, StepType = AiStepType.LawsuitCaseType, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new AiStageModelConfig { Id = 6, StepType = AiStepType.LawsuitParties, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new AiStageModelConfig { Id = 7, StepType = AiStepType.LawsuitSubjects, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new AiStageModelConfig { Id = 8, StepType = AiStepType.LawsuitFacts, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new AiStageModelConfig { Id = 9, StepType = AiStepType.LawsuitLegalBasis, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new AiStageModelConfig { Id = 10, StepType = AiStepType.LawsuitRequests, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new AiStageModelConfig { Id = 11, StepType = AiStepType.Ocr, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new AiStageModelConfig { Id = 12, StepType = AiStepType.Chat, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new AiStageModelConfig { Id = 900, StepType = AiStepType.LegalContractDraft, ModelIdentifier = "gemini-3.1-pro-preview", UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );
        }
    }
}
