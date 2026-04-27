using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Dtos.Case
{
	public class CaseExtractionResultDto
	{
		public string Title { get; set; } = string.Empty;
		public string Number { get; set; } = string.Empty;
		public string Court { get; set; } = string.Empty;
		public string ClientName { get; set; } = string.Empty;
		public string ApponentName { get; set; } = string.Empty;
		public string Description { get; set; } = string.Empty;
		public string Facts { get; set; } = string.Empty;
		public string LegalClaims { get; set; } = string.Empty;
		/// <summary>Legacy single type string — kept for backward compat. Prefer Types.</summary>
		public string Type { get; set; } = string.Empty;
		/// <summary>Multiple case type names as returned by AI (e.g. ["جنحة","عمالي"]).</summary>
		public List<string> Types { get; set; } = new();
		/// <summary>Matched case type IDs from the available list provided to the AI.</summary>
		public List<int> CaseTypeIds { get; set; } = new();
	}

	public class AvailableCaseTypeDto
	{
		public int Id { get; set; }
		public string Title { get; set; } = string.Empty;
	}

    public class CaseGenerateRequest
    {
        public string RevisedText { get; set; } = string.Empty;
    }

}
