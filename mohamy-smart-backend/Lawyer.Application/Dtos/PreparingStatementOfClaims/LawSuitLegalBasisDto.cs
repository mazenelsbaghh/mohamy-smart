namespace Lawyer.Application.Dtos.PreparingStatementOfClaims
{
    public class LawSuitLegalBasisRequestDto
    {
        public Guid CaseId { get; set; }
    }

    public class LawSuitLegalBasisResponseDto
    {
        public Guid CaseId { get; set; }

        public List<LegalTextDto> LegalTexts { get; set; } = new();

        public List<CassationRulingDto> CassationRulings { get; set; } = new();
    }

    public class LegalTextDto
    {
        public Guid Id { get; set; }

        public string LawName { get; set; } = string.Empty;

        public string ArticleNumber { get; set; } = string.Empty;

        public string ArticleText { get; set; } = string.Empty;

        public string ApplicationNotes { get; set; } = string.Empty;
    }

    public class CassationRulingDto
    {
        public Guid Id { get; set; }
        public string Court { get; set; } = string.Empty;

        public string AppealNumber { get; set; } = string.Empty;

        public string JudicialYear { get; set; } = string.Empty;

        public string SessionDate { get; set; } = string.Empty;

        public string RulingText { get; set; } = string.Empty;

        public string ApplicationNotes { get; set; } = string.Empty;
    }
}
