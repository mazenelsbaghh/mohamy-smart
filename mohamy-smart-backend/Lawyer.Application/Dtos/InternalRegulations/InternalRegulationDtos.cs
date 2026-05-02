using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace Lawyer.Application.Dtos.InternalRegulations
{
    public class InternalRegulationDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? RegulationNumber { get; set; }
        public string? IssuingAuthority { get; set; }
        public string? Summary { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
    }

    public class InternalRegulationSummaryDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? RegulationNumber { get; set; }
        public string? IssuingAuthority { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateInternalRegulationDto
    {
        public string Title { get; set; } = string.Empty;
        public string? RegulationNumber { get; set; }
        public string? IssuingAuthority { get; set; }
        public string? Summary { get; set; }
        public string Content { get; set; } = string.Empty;
    }

    public class CreateInternalRegulationFromOcrDto
    {
        public string Title { get; set; } = string.Empty;
        public string? RegulationNumber { get; set; }
        public string? IssuingAuthority { get; set; }
        public string? Summary { get; set; }
        public List<IFormFile> Files { get; set; } = new();
    }

    public class UpdateInternalRegulationDto
    {
        public string Title { get; set; } = string.Empty;
        public string? RegulationNumber { get; set; }
        public string? IssuingAuthority { get; set; }
        public string? Summary { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    public class UpdateCaseInternalRegulationsDto
    {
        public List<Guid> InternalRegulationIds { get; set; } = new();
    }
}
