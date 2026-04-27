using System.ComponentModel.DataAnnotations;

namespace Lawyer.Application.Dtos.Lawyers
{
	public class UpdateLawyerStatusDto
	{
		[Required]
		public bool IsActive { get; set; }
	}
}
