namespace Lawyer.Core.Enum
{
    public enum AiChargeState
    {
        Pending = 0,
        Held = 1,
        Charged = 2,
        NoCharge = 3,
        Restored = 4
    }

    public enum AiRepeatIntent
    {
        RetryAfterFailure = 0,
        RegenerateAfterSuccess = 1,
        StartOver = 2
    }

    public enum AiPointTransactionType
    {
        Hold = 0,
        Charge = 1,
        Restore = 2,
        NoCharge = 3
    }

    public enum AiPointReasonCode
    {
        Success = 0,
        Failed = 1,
        Timeout = 2,
        Cancelled = 3,
        Conflict = 4,
        StaleIgnored = 5,
        InvalidOutput = 6,
        InsufficientPoints = 7,
        ConfirmationDeclined = 8,
        Blocked = 9
    }
}
