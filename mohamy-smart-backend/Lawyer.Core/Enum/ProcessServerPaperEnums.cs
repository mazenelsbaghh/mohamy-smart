using System;

namespace Lawyer.Core.Enum
{
    public enum ProcessServerPaperType
    {
        Announcement = 1,      // إعلان
        Warning = 2,           // إنذار
        Execution = 3,         // تنفيذ
        Summons = 4,           // تكليف بالحضور
        Other = 99             // أخرى
    }

    public enum ProcessServerPaperStatus
    {
        Pending = 1,           // قيد التجهيز
        InProgress = 2,        // جاري التنفيذ بالمحكمة
        Served = 3,            // تم الإعلان / التنفيذ
        Failed = 4             // تعذر الإعلان
    }
}
