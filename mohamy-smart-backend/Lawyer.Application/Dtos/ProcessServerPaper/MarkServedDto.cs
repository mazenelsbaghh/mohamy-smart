using System;
using System.ComponentModel.DataAnnotations;

namespace Lawyer.Application.Dtos.ProcessServerPaper
{
    public class MarkServedDto
    {
        [Required]
        public DateTime ServedDate { get; set; }
    }
}
