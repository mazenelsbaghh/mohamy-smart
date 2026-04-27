using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Core.Models
{
	public class Lawyer : BaseEntity<Guid>
	{
		public Guid ApplicationUserId { get; set; }
		public string? BarNumber { get; set; } // رقم القيد بنقابة المحامين
		public string? Specialization { get; set; } // جنائي / مدني / إداري / ...

		[Column("ExperinceNumber")]
		public string ?ExperienceNumber { get; set; }
		public string? BirthDate { get; set; }
		public string? LawFirmName { get; set; } // مكتب المحاماه
		public ApplicationUser ApplicationUser { get; set; } = null!;
		public ICollection<LawyerSubscription> LawyerSubscriptions { get; set; } = new List<LawyerSubscription>();
		public ICollection<Client> Clients { get; set; } = new List<Client>();
		public ICollection<Review> Reviews { get; set; } = new List<Review>();

	}
}
