using System.Text.Json.Serialization;

namespace Lawyer.Core.Models.Agenda
{
    public class ActionAgendaItem : AgendaItem
    {
        [JsonPropertyName("type")]
        public override string ItemType => "Action";
        
        public ActionType ActionType { get; set; }
        public string ExecutionDetails { get; set; } = string.Empty;
        public string? Location { get; set; }
    }

    public enum ActionType
    {
        Inspection,
        Execution
    }
}
