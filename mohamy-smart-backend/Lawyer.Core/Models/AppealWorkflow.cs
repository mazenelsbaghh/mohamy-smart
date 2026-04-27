using Lawyer.Core.Enum;

namespace Lawyer.Core.Models
{
    public class AppealWorkflow : WorkflowBase
    {
        public string? Step1Output { get; set; }
        public string? Step2Output { get; set; }
        public string? Step3Output { get; set; }
        public string? Step4Output { get; set; }
        public string? Step5Output { get; set; }
        public string? Step6Output { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public override int TotalSteps => 6;

        public override string? GetStepOutput(int stepNumber) => stepNumber switch 
        {
            1 => Step1Output,
            2 => Step2Output,
            3 => Step3Output,
            4 => Step4Output,
            5 => Step5Output,
            6 => Step6Output,
            _ => null
        };

        public override void SetStepOutput(int stepNumber, string? json)
        {
            switch (stepNumber)
            {
                case 1: Step1Output = json; break;
                case 2: Step2Output = json; break;
                case 3: Step3Output = json; break;
                case 4: Step4Output = json; break;
                case 5: Step5Output = json; break;
                case 6: Step6Output = json; break;
            }
        }
    }
}
