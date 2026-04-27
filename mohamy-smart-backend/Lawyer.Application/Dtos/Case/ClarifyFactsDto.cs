using System;
using System.Collections.Generic;

namespace Lawyer.Application.Dtos.Case
{
    /// <summary>
    /// Request DTO sent by the frontend when the lawyer clicks "Start Analysis".
    /// Contains the case ID whose facts should be evaluated for gaps.
    /// </summary>
    public class ClarifyFactsRequestDto
    {
        public Guid CaseId { get; set; }
    }

    /// <summary>
    /// A single clarification question returned by the AI, including 3 suggested answers.
    /// The frontend will append a 4th "Other / Custom Input" option automatically.
    /// </summary>
    public class ClarifyFactsQuestionDto
    {
        public string QuestionText { get; set; } = string.Empty;
        public List<string> SuggestedOptions { get; set; } = new();
    }

    /// <summary>
    /// Response DTO containing the list of clarification questions.
    /// An empty list means the facts are comprehensive and analysis can proceed.
    /// </summary>
    public class ClarifyFactsResponseDto
    {
        public List<ClarifyFactsQuestionDto> Questions { get; set; } = new();
    }
}
