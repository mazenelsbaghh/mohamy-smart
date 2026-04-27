namespace Lawyer.Application.Dtos.CaseType
{
	public class CaseTypeDto
	{
		public int Id { get; set; }
		public string Title { get; set; } = string.Empty;
	}

	public class CreateCaseTypeDto
	{
		public string Title { get; set; } = string.Empty;
	}

	public class UpdateCaseTypeDto
	{
		public string Title { get; set; } = string.Empty;
	}
}
