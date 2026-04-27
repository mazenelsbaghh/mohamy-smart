using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Lawyer.Core.Models.Agenda
{
    [JsonDerivedType(typeof(SessionAgendaItem), "Session")]
    [JsonDerivedType(typeof(ActionAgendaItem), "Action")]
    public abstract class AgendaItem : BaseEntity<Guid>
    {
        public Guid CaseId { get; set; }
        
        [JsonIgnore]
        public Case Case { get; set; } = null!;
        
        public string Title { get; set; } = string.Empty;
        public DateTimeOffset Date { get; set; }
 public DateTimeOffset? EndDate { get; set; }
        public AgendaStatus Status { get; set; }

        [NotMapped]
        [JsonPropertyName("type")]
        public abstract string ItemType { get; }
    }

    public enum AgendaStatus
    {
        Scheduled,
        Completed,
        Postponed,
        Cancelled
    }
}
