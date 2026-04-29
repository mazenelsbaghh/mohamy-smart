namespace Lawyer.Application.Services.Workflows
{
    public class WorkflowInvocationContext
    {
        public int WorkflowId { get; set; }
        public string LawyerId { get; set; } = string.Empty;
        public string? RunId { get; set; }
        public string? WorkflowType { get; set; }
        public int? StepNumber { get; set; }

        public WorkflowInvocationContext() { }

        public WorkflowInvocationContext(int workflowId, string lawyerId)
        {
            WorkflowId = workflowId;
            LawyerId = lawyerId;
        }

        public WorkflowInvocationContext(int workflowId, string lawyerId, string? runId, string? workflowType, int? stepNumber)
        {
            WorkflowId = workflowId;
            LawyerId = lawyerId;
            RunId = runId;
            WorkflowType = workflowType;
            StepNumber = stepNumber;
        }
    }
}
