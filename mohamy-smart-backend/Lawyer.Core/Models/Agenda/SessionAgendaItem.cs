using System;
using System.Text.Json.Serialization;

namespace Lawyer.Core.Models.Agenda
{
    public class SessionAgendaItem : AgendaItem
    {
        [JsonPropertyName("type")]
        public override string ItemType => "Session";
        
        public string SessionType { get; set; } = string.Empty;
        public string CourtName { get; set; } = string.Empty;
        
        public Guid? PreviousSessionId { get; set; }
        
        [JsonIgnore]
        public SessionAgendaItem PreviousSession { get; set; } = null!;
        
        public string? PostponementReason { get; set; }

        public string? PreviousDecision { get; set; }
        
        public Guid? AssignedLawyerId { get; set; }
        [JsonIgnore]
        public ApplicationUser AssignedLawyer { get; set; } = null!;
    }
}
