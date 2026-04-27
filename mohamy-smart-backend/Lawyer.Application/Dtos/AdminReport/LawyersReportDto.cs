namespace Lawyer.Application.Dtos.AdminReport
{
	public class LawyersReportDto
	{
		public int TotalLawyers { get; set; }
		public int TotalActive { get; set; }
		public int TotalInactive { get; set; }
		public List<RecentLawyerDto> RecentRegistrations { get; set; } = new();
	}

	public class RecentLawyerDto
	{
		public Guid Id { get; set; }
		public string Name { get; set; } = string.Empty;
		public DateTime JoinedAt { get; set; }
	}
}
