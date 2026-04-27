using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lawyer.Core.Models
{
	public class BaseEntity<TKey>
	{
		[Key]
		[Required]
		[Column(Order = 0)]
		[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public TKey Id { get; set; } = default!;

		[Required]
		[Column(Order = 110)]
		[DisplayFormat(DataFormatString = "{0:dd/MM/yyyy hh:mm tt}", ApplyFormatInEditMode = true)]
		public DateTime Created { get; set; }

		[Required]
		[Column(Order = 120)]
		[Display(Name = "Created By")]
		public Guid CreatedBy { get; set; }

		[Required]
		[Column(Order = 130)]
		[DisplayFormat(DataFormatString = "{0:dd/MM/yyyy hh:mm tt}", ApplyFormatInEditMode = true)]
		public DateTime? Updated { get; set; } = DateTime.UtcNow;

		[Required]
		[Column(Order = 140)]
		[Display(Name = "Updated By")]
		public Guid UpdatedBy { get; set; }

		public bool IsActive { get; set; } = true;

		[Timestamp]
		[Column(Order = 150)]
		public byte[] RowVersion { get; set; } = Array.Empty<byte>();
	}
}
