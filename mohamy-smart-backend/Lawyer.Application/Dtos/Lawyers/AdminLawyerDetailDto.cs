using Lawyer.Core.Enum;

namespace Lawyer.Application.Dtos.Lawyers;

public class AdminLawyerDetailDto
{
    public Guid Id { get; set; }
    public Guid? LawyerId { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
    public bool EmailConfirmed { get; set; }
    public UserType UserType { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Governorate { get; set; }
    public bool AgreedToTerms { get; set; }
    public string? BarNumber { get; set; }
    public string? Specialization { get; set; }
    public string? ExperienceNumber { get; set; }
    public string? LawFirmName { get; set; }
    public string? BirthDate { get; set; }
    public DateTime? LawyerCreatedAt { get; set; }
    public DateTime? LawyerProfileCreatedAt { get; set; }
    public string? SubscriptionPlanName { get; set; }
    public bool? SubscriptionIsActive { get; set; }
    public int NumberOfCases { get; set; }
    public AdminLawyerSubscriptionSummaryDto? Subscription { get; set; }
    public AdminLawyerActivitySummaryDto Activity { get; set; } = new();
    public List<AdminLawyerRecentCaseDto> RecentCases { get; set; } = new();
    public List<AdminLawyerSubscriptionSummaryDto> RecentSubscriptions { get; set; } = new();
    public List<AdminLawyerRecentReviewDto> RecentReviews { get; set; } = new();
    public List<AdminLawyerRecentAiUsageDto> RecentAiUsage { get; set; } = new();
    public AdminManualPhoneVerificationAuditDto? LatestManualPhoneVerification { get; set; }
}

public class AdminManualPhoneVerificationRequestDto
{
    public string Reason { get; set; } = string.Empty;
}

public class AdminPhoneVerificationResultDto
{
    public Guid Id { get; set; }
    public string? PhoneNumber { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
    public AdminManualPhoneVerificationAuditDto? LatestManualPhoneVerification { get; set; }
}

public class AdminManualPhoneVerificationAuditDto
{
    public Guid Id { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public Guid VerifiedByAdminId { get; set; }
    public string? VerifiedByAdminName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminLawyerSubscriptionSummaryDto
{
    public Guid Id { get; set; }
    public string? PlanName { get; set; }
    public bool IsActive { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DurationDays { get; set; }
    public int? AiRequestsLimit { get; set; }
    public int UsedAiRequests { get; set; }
    public decimal Price { get; set; }
    public decimal? YearlyPrice { get; set; }
}

public class AdminLawyerActivitySummaryDto
{
    public int CasesCount { get; set; }
    public int ActiveCasesCount { get; set; }
    public int ClientsCount { get; set; }
    public int PowersOfAttorneyCount { get; set; }
    public int ActivePowersOfAttorneyCount { get; set; }
    public int ReviewsCount { get; set; }
    public int ApprovedReviewsCount { get; set; }
    public int PendingReviewsCount { get; set; }
    public decimal? AverageReviewRating { get; set; }
    public int AiUsageCount { get; set; }
    public long AiTotalTokens { get; set; }
    public decimal AiEstimatedCostUsd { get; set; }
    public DateTime? LastActivityAt { get; set; }
}

public class AdminLawyerRecentCaseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string Court { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public CaseStatus Status { get; set; }
    public DateTime Created { get; set; }
    public bool IsActive { get; set; }
}

public class AdminLawyerRecentReviewDto
{
    public Guid Id { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public string? ReviewerRole { get; set; }
    public int Rating { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public DateTime Created { get; set; }
}

public class AdminLawyerRecentAiUsageDto
{
    public Guid Id { get; set; }
    public Guid? CaseId { get; set; }
    public AiStepType AiStepType { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string ModelIdentifier { get; set; } = string.Empty;
    public int TotalTokens { get; set; }
    public decimal EstimatedCostUsd { get; set; }
    public DateTime CreatedAt { get; set; }
}
