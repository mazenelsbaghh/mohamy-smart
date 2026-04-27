namespace Lawyer.Application.Dtos.AdminComplaint
{
    public class AdminComplaintWorkflowDto
    {
        public int Id { get; set; }
        public Guid CaseId { get; set; }
        public string LawyerId { get; set; } = string.Empty;
        public int CurrentStep { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Step1Output { get; set; }
        public string? Step2Output { get; set; }
        public string? Step3Output { get; set; }
        public string? Step4Output { get; set; }
        public string? Step5Output { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
