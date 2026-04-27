using System;
using System.ComponentModel.DataAnnotations;

namespace Lawyer.Application.Dtos.Reviews
{
    public class ReviewDto
    {
        public Guid Id { get; set; }
        public string LawyerId { get; set; } = null!;
        public string LawyerName { get; set; } = null!;
        public string ReviewerName { get; set; } = null!;
        public string? ReviewerRole { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime Created { get; set; }
    }

    public class CreateReviewDto
    {
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
    }

    public class UpdateReviewStatusDto
    {
        [Required]
        public string Status { get; set; } = null!;
    }
}
