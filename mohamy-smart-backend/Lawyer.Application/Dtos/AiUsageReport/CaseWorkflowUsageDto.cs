namespace Lawyer.Application.Dtos.AiUsageReport
{
    public class WorkflowUsageDto
    {
        public string WorkflowKey { get; set; } = "";
        public string WorkflowName { get; set; } = "";
        public int? WorkflowId { get; set; }
        public string? WorkflowRunId { get; set; }
        public bool IsLegacyAggregate { get; set; }
        public int RequestCount { get; set; }
        public decimal TotalCostUsd { get; set; }
        public List<StepUsageDto> Steps { get; set; } = [];
    }

    public class CaseWorkflowUsageDto
    {
        public Guid CaseId { get; set; }
        public string CaseTitle { get; set; } = "";
        public string CaseNumber { get; set; } = "";
        public int UsedWorkflowCount { get; set; }
        public int TotalWorkflowCount { get; set; }
        public decimal TotalCostUsd { get; set; }
        public List<WorkflowUsageDto> Workflows { get; set; } = [];
    }
}
