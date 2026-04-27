using System;

namespace Lawyer.Application.Dtos.Client
{
	public class CreateClientDto
	{
		public string ClientName { get; set; } = string.Empty;
		public string PhoneNumber { get; set; } = string.Empty;
		public string? Email { get; set; }
		public string? Notes { get; set; }
		public string? Address { get; set; }
		public string? NationalId { get; set; }
		public string? Governorate { get; set; }
		public Guid? CaseId { get; set; }
	}

	public class UpdateClientDto
	{
		public string ClientName { get; set; } = string.Empty;
		public string PhoneNumber { get; set; } = string.Empty;
		public string? Email { get; set; }
		public string? Notes { get; set; }
		public string? Address { get; set; }
		public string? NationalId { get; set; }
		public string? Governorate { get; set; }
		public Guid? CaseId { get; set; }
	}

	public class ClientCaseSummaryDto
	{
		public Guid Id { get; set; }
		public string Title { get; set; } = string.Empty;
		public string Number { get; set; } = string.Empty;
		public string Court { get; set; } = string.Empty;
		public Lawyer.Core.Enum.CaseStatus Status { get; set; }
		public DateTime CreationDate { get; set; }
	}

	public class ClientDto
	{
		public Guid Id { get; set; }
		public string ClientName { get; set; } = string.Empty;
		public string PhoneNumber { get; set; } = string.Empty;
		public string? Email { get; set; }
		public string? Notes { get; set; }
		public string? Address { get; set; }
		public string? NationalId { get; set; }
		public string? Governorate { get; set; }
		public Guid LawyerId { get; set; }
		public Guid? CaseId { get; set; }
		public DateTime CreationDate { get; set; }
		public System.Collections.Generic.List<ClientCaseSummaryDto> Cases { get; set; } = new();
		public System.Collections.Generic.List<ClientFileDto> Files { get; set; } = new();
	}

	public class ClientFileDto
	{
		public Guid Id { get; set; }
		public string FileName { get; set; } = string.Empty;
		public string FilePath { get; set; } = string.Empty;
		public string ContentType { get; set; } = string.Empty;
		public long FileSize { get; set; }
		public DateTime CreationDate { get; set; }
	}
}
