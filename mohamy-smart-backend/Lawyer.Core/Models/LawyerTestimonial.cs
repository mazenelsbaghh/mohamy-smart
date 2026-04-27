using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Core.Models
{
	public class LawyerTestimonial : BaseEntity<int>
	{
	
			public int LawyerId { get; set; }
			public string FeedbackText { get; set; } = string.Empty;
			public int Rating { get; set; }
			public bool IsPublished { get; set; } = false;

			public Lawyer Lawyer { get; set; } = null!;
		}

}
