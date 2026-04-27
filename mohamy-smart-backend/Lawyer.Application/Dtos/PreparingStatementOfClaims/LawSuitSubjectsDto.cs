namespace Lawyer.Application.Dtos.PreparingStatementOfClaims
{
    public class LawSuitSubjectsRequestDto
    {
        public Guid CaseId { get; set; }
    }

    public class LawSuitSubjectsResponseDto
    {
        public Guid CaseId { get; set; }

        public string SubjectTitle { get; set; } = string.Empty;

        public string SubjectFullText { get; set; } = string.Empty;
    }
}
