namespace Lawyer.Application.Services.Workflows
{
    public class WorkflowInvocationContext
    {
        public int WorkflowId { get; set; }
        public string LawyerId { get; set; } = string.Empty;

        public WorkflowInvocationContext() { }

        public WorkflowInvocationContext(int workflowId, string lawyerId)
        {
            WorkflowId = workflowId;
            LawyerId = lawyerId;
        }
    }
}
