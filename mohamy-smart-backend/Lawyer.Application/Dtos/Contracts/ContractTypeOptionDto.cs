namespace Lawyer.Application.Dtos.Contracts
{
    /// <summary>
    /// A single contract type option for the create-contract type selector
    /// </summary>
    public class ContractTypeOptionDto
    {
        public string Code { get; set; } = string.Empty;
        public string DisplayNameAr { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
    }
}
