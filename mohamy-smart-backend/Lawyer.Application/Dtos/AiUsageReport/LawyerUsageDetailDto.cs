namespace Lawyer.Application.Dtos.AiUsageReport
{
    public class LawyerUsageDetailDto : LawyerUsageDto
    {
        public List<StepUsageDto> PerStep { get; set; } = [];
        public List<ModelUsageDto> PerModel { get; set; } = [];
        public List<DailyCostDto> DailyCosts { get; set; } = [];
        public List<CaseWorkflowUsageDto> PerCaseWorkflows { get; set; } = [];

        /// <summary>
        /// تكاليف المسارات غير المرتبطة بقضايا (مثل إنشاء العقود القانونية)
        /// </summary>
        public List<WorkflowUsageDto> StandaloneCosts { get; set; } = [];
    }
}
