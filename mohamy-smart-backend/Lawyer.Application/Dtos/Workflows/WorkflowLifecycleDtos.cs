using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Lawyer.Application.Dtos.Workflows
{
    public record WorkflowRunSummaryDto(
        [property: JsonPropertyName("runId")] string RunId,
        [property: JsonPropertyName("caseId")] Guid CaseId,
        [property: JsonPropertyName("workflowType")] string WorkflowType,
        [property: JsonPropertyName("status")] string Status,
        [property: JsonPropertyName("createdAt")] DateTime CreatedAt,
        [property: JsonPropertyName("updatedAt")] DateTime UpdatedAt,
        [property: JsonPropertyName("currentAccessibleStep")] int CurrentAccessibleStep,
        [property: JsonPropertyName("lastCompletedStep")] int LastCompletedStep,
        [property: JsonPropertyName("isReadOnly")] bool IsReadOnly,
        [property: JsonPropertyName("snapshotLabel")] string? SnapshotLabel,
        [property: JsonPropertyName("canStart")] bool CanStart,
        [property: JsonPropertyName("canResumeCurrent")] bool CanResumeCurrent,
        [property: JsonPropertyName("canStartNew")] bool CanStartNew,
        [property: JsonPropertyName("currentRunCreatedAt")] DateTime? CurrentRunCreatedAt
    );

    public record WorkflowStageSummaryDto(
        [property: JsonPropertyName("stepNumber")] int StepNumber,
        [property: JsonPropertyName("status")] string Status,
        [property: JsonPropertyName("hasOutput")] bool HasOutput,
        [property: JsonPropertyName("isAccessible")] bool IsAccessible
    );

    public record ActiveStageRequestDto(
        [property: JsonPropertyName("requestId")] string RequestId,
        [property: JsonPropertyName("stepNumber")] int StepNumber,
        [property: JsonPropertyName("stepType")] string StepType,
        [property: JsonPropertyName("status")] string Status,
        [property: JsonPropertyName("createdAt")] DateTime CreatedAt,
        [property: JsonPropertyName("startedAt")] DateTime? StartedAt
    );

    public record TransitionStageRequestDto(
        [property: JsonPropertyName("runId")] string RunId,
        [property: JsonPropertyName("fromStep")] int FromStep,
        [property: JsonPropertyName("toStep")] int ToStep
    );

    public record WorkflowStageConflictResponseDto(
        [property: JsonPropertyName("requestId")] string RequestId,
        [property: JsonPropertyName("stepNumber")] int StepNumber,
        [property: JsonPropertyName("errorCode")] string ErrorCode,
        [property: JsonPropertyName("message")] string Message,
        [property: JsonPropertyName("availableActions")] List<string> AvailableActions,
        [property: JsonPropertyName("detectedAt")] DateTime DetectedAt
    );

    public record WorkflowStartNewResponseDto(
        [property: JsonPropertyName("id")] int Id,
        [property: JsonPropertyName("runId")] string RunId,
        [property: JsonPropertyName("caseId")] Guid CaseId,
        [property: JsonPropertyName("workflowType")] string WorkflowType,
        [property: JsonPropertyName("status")] string Status,
        [property: JsonPropertyName("currentAccessibleStep")] int CurrentAccessibleStep,
        [property: JsonPropertyName("lastCompletedStep")] int LastCompletedStep,
        [property: JsonPropertyName("isReadOnly")] bool IsReadOnly,
        [property: JsonPropertyName("createdAt")] DateTime CreatedAt,
        [property: JsonPropertyName("updatedAt")] DateTime UpdatedAt,
        [property: JsonPropertyName("canStart")] bool CanStart,
        [property: JsonPropertyName("canResumeCurrent")] bool CanResumeCurrent,
        [property: JsonPropertyName("canStartNew")] bool CanStartNew,
        [property: JsonPropertyName("currentRunCreatedAt")] DateTime? CurrentRunCreatedAt
    );

    public record RecoverConflictRequest(
        [property: JsonPropertyName("stepNumber")] int StepNumber
    );
}
