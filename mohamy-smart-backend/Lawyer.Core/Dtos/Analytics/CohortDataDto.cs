using System;
using System.Collections.Generic;

namespace Lawyer.Core.Dtos.Analytics
{
    public class CohortDataDto
    {
        public string CohortMonth { get; set; } = string.Empty;
        public int TotalUsers { get; set; }
        public Dictionary<string, double> RetentionRates { get; set; } = new Dictionary<string, double>();
    }
}
