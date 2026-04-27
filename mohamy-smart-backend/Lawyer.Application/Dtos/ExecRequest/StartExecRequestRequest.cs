namespace Lawyer.Application.Dtos.ExecRequest
{
    public class StartExecRequestRequest
    {
        public Guid CaseId { get; set; }
        public string ExecutiveTitleType { get; set; } = "judicial";
    }
}
