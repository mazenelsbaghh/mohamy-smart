using Lawyer.Core.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Dtos.Case
{
	public class CreateCaseDto
	{
		public string Title { get; set; } = string.Empty;
		public string Number { get; set; } = string.Empty;
		/// <summary>All selected type IDs. First element used as primary FK (CaseTypeId).</summary>
		public List<int> CaseTypeIds { get; set; } = new();
		public string Court { get; set; } = string.Empty;
		public string ClientName { get; set; } = string.Empty;
		public string? ApponentName { get; set; }
		public string DefendingParty { get; set; } = "client";
		public string Description { get; set; } = string.Empty;
		public string Facts { get; set; } = string.Empty;           // وقائع القضية
		public string LegalClaims { get; set; } = string.Empty;     // الطلبات القانونية
		public bool IsExistedClient { get; set; }
		public Guid? ClientId { get; set; }
		public Guid? PowerOfAttorneyId { get; set; }
	}


	public class UpdateCaseDto
	{
		public string Title { get; set; } = string.Empty;
		public string Number { get; set; } = string.Empty;
		public List<int> CaseTypeIds { get; set; } = new();
		public CaseStatus Status { get; set; }
		public string Court { get; set; } = string.Empty;
		public string ClientName { get; set; } = string.Empty;
		public string? ApponentName { get; set; }
		public string Description { get; set; } = string.Empty;
		public string Facts { get; set; } = string.Empty;           // وقائع القضية
		public string LegalClaims { get; set; } = string.Empty;     // الطلبات القانونية
		public Guid? PowerOfAttorneyId { get; set; }
	}

	public class CaseDto
	{
		public Guid Id { get; set; }
		public string Title { get; set; } = string.Empty;
		public string Number { get; set; } = string.Empty;
		public int CaseTypeId { get; set; }
		public string CaseTypeName { get; set; } = string.Empty;
		public List<int> CaseTypeIds { get; set; } = new();
		public List<string> CaseTypeNames { get; set; } = new();
		public string Court { get; set; } = string.Empty;
		public string ClientName { get; set; } = string.Empty;
		public string? ApponentName { get; set; }
		public string DefendingParty { get; set; } = "client";
		public string Description { get; set; } = string.Empty;
		public string Facts { get; set; } = string.Empty;
		public string LegalClaims { get; set; } = string.Empty;
		public CaseStatus Status { get; set; }
		public Guid? ClientId { get; set; }
		public Guid? PowerOfAttorneyId { get; set; }
		public DateTime CreationDate { get; set; }
	}

	public class CaseFactsDto
		{
		public Guid CaseId { get; set; }
		public string Facts { get; set; } = string.Empty;
    }


}
