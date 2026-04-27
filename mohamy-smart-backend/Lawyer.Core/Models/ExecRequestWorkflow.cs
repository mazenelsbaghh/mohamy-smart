using Lawyer.Core.Enum;

namespace Lawyer.Core.Models
{
    public class ExecRequestWorkflow : WorkflowBase
    {
        public string ExecutiveTitleType { get; set; } = "judicial";
        public string? Step1Output { get; set; }
        public string? Step2Output { get; set; }
        public string? Step3Output { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public override int TotalSteps => 3;

        public override string? GetStepOutput(int stepNumber) => stepNumber switch 
        {
            1 => Step1Output,
            2 => Step2Output,
            3 => Step3Output,
            _ => null
        };

        public override void SetStepOutput(int stepNumber, string? json)
        {
            switch (stepNumber)
            {
                case 1: Step1Output = json; break;
                case 2: Step2Output = json; break;
                case 3: Step3Output = json; break;
            }
        }
    }
}
