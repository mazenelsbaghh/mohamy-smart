using System;

namespace Lawyer.Core.Exceptions
{
    public class WorkflowConcurrencyException : Exception
    {
        public WorkflowConcurrencyException(string? message)
            : base(message ?? "تم تحديث سير العمل من قبل مستخدم آخر. يرجى إعادة تحميل الصفحة.")
        {
        }
    }
}
