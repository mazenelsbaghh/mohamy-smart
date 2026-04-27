using System;

namespace Lawyer.Application.Dtos.LawyerTask
{
	public class CreateLawyerTaskDto
	{
		public string Title { get; set; } = string.Empty;
		public DateTime Date { get; set; }
		public TimeSpan? Time { get; set; }
		public string? Notes { get; set; }
	}

	public class UpdateLawyerTaskDto
	{
		public string Title { get; set; } = string.Empty;
		public DateTime Date { get; set; }
		public TimeSpan? Time { get; set; }
		public string? Notes { get; set; }
		public bool IsActive { get; set; }
	}

	public class LawyerTaskDto
	{
		public Guid Id { get; set; }
		public string Title { get; set; } = string.Empty;
		public DateTime Date { get; set; }
		public TimeSpan? Time { get; set; }
		public string? Notes { get; set; }
		public Guid LawyerId { get; set; }
		public bool IsActive { get; set; }
		public DateTime CreationDate { get; set; }
	}
}
