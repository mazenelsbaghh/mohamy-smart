using System;

namespace Lawyer.Core.Exceptions
{
    public class SchemaValidationException : Exception
    {
        public string WorkflowType { get; }
        public int StepType { get; }
        public string ErrorSummary { get; }
        public string? RawOutput { get; }

        public SchemaValidationException(string workflowType, int stepType, string errorSummary, string? rawOutput = null)
            : base($"Schema validation failed for workflow '{workflowType}' step {stepType}: {errorSummary}")
        {
            WorkflowType = workflowType;
            StepType = stepType;
            ErrorSummary = errorSummary;
            RawOutput = rawOutput?.Length > 2000 ? rawOutput[..2000] : rawOutput;
        }
    }
}
