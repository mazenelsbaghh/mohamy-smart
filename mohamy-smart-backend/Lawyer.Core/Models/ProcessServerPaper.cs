using System;
using System.ComponentModel.DataAnnotations.Schema;
using Lawyer.Core.Enum;

namespace Lawyer.Core.Models
{
    public class ProcessServerPaper : BaseEntity<Guid>
    {
        public Guid ClientId { get; set; }
        [ForeignKey("ClientId")]
        public virtual Client Client { get; set; }

        public Guid? CaseId { get; set; }
        [ForeignKey("CaseId")]
        public virtual Case? Case { get; set; }

        public Guid LawyerId { get; set; }
        [ForeignKey("LawyerId")]
        public virtual Lawyer Lawyer { get; set; }

        public ProcessServerPaperType PaperType { get; set; }
        public string? OtherPaperType { get; set; }
        public string? CustomPaperTypeTitle { get; set; }
        
        public string TargetName { get; set; } = string.Empty;
        public string? ProcessServerName { get; set; }
        public string? DeliveryNumber { get; set; }
        public ProcessServerPaperStatus Status { get; set; }
        
        public string? Notes { get; set; }
        public string? AttachmentUrl { get; set; }
        public DateTime? ServedDate { get; set; }
    }
}
