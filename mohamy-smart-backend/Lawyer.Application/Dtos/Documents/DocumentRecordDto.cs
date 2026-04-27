using System;

namespace Lawyer.Application.Dtos.Documents
{
    public class DocumentRecordDto
    {
        public Guid DocumentId { get; set; }
        public Guid? CaseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string SourceType { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string PreviewUrl { get; set; } = string.Empty;
        public string DownloadUrl { get; set; } = string.Empty;
        public string ExtractedTextSnippet { get; set; } = string.Empty;
        public string AvailabilityState { get; set; } = string.Empty;
    }
}
