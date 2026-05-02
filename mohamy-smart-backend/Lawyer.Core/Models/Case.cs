using Lawyer.Core.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Core.Models
{
	public class Case : BaseEntity<Guid>
	{
		public string Title { get; set; } = string.Empty;
		public string Number { get; set; } = string.Empty;

		public int CaseTypeId { get; set; }
		public CaseType CaseType { get; set; } = null!;

		/// <summary>JSON array of additional CaseType IDs (e.g. "[1,8,15]"). Primary type is CaseTypeId.</summary>
		public string? CaseTypeIds { get; set; }
		public string Court { get; set; } = string.Empty;
		public string ClientName { get; set; } = string.Empty;
		public string ApponentName { get; set; } = string.Empty;
		public string DefendingParty { get; set; } = "client";


		public string Description { get; set; } = string.Empty;
		public string Facts {  get; set; } = string.Empty;     //وقائع القضيه
		public string LegalClaims { get; set; } = string.Empty;   // الطلبات القانونيه
		public string? InternalRegulationsContext { get; set; }

		public CaseStatus Status { get; set; }

		public Guid? ClientId { get; set; }
		public Client Client { get; set; } = null!;

		public Guid? PowerOfAttorneyId { get; set; }
		public PowerOfAttorney PowerOfAttorney { get; set; } = null!;

		public Guid LawyerId { get; set; }

		public Lawyer Lawyer {  get; set; } = null!;

		public ICollection<FactAnalysis> FactAnalyses { get; set; } = new List<FactAnalysis>();
		public ICollection<Defense> Defenses { get; set; } = new List<Defense>();
		public ICollection<FinalPrayer> FinalPrayers { get; set; } = new List<FinalPrayer>();
		public ICollection<LawSuitCaseType> LawSuitCaseTypes { get; set; } = new List<LawSuitCaseType>();
		public ICollection<LawSuitParty> LawSuitParties { get; set; } = new List<LawSuitParty>();
		public ICollection<LawSuitSubject> LawSuitSubjects { get; set; } = new List<LawSuitSubject>();
		public ICollection<LawSuitFacts> LawSuitFacts { get; set; } = new List<LawSuitFacts>();
		public ICollection<CaseInternalRegulation> CaseInternalRegulations { get; set; } = new List<CaseInternalRegulation>();
	}
}
