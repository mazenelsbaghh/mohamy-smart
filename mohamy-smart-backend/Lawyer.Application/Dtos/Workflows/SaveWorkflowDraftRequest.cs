using System.ComponentModel.DataAnnotations;

namespace Lawyer.Application.Dtos.Workflows
{
    public class SaveWorkflowDraftRequest
    {
        [Required]
        public int StepIndex { get; set; }

        public bool IsDraft { get; set; } = true;

        [Required]
        public object Payload { get; set; } = null!;
    }
}
