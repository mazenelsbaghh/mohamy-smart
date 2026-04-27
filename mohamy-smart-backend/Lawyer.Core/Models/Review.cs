using System;
using System.ComponentModel.DataAnnotations;
using Lawyer.Core.Models;

namespace Lawyer.Core.Models
{
    public class Review : BaseEntity<Guid>
    {
        [Required]
        public string LawyerId { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string ReviewerName { get; set; } = null!;

        [MaxLength(200)]
        public string? ReviewerRole { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Comment { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";

        public Lawyer Lawyer { get; set; } = null!;
    }
}
