namespace Lawyer.Application.Dtos.Admin
{
	public class AdjustAiPointsRequest
	{
		public int Amount { get; set; }
	}

	public class AdjustAiPointsResultDto
	{
		public int Remaining { get; set; }
		public int Used { get; set; }
		public int Limit { get; set; }
	}
}
