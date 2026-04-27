using System;

namespace Lawyer.Application.Common
{
    public static class PaginationDefaults
    {
        public const int DefaultPageSize = 10;
        public const int MaxPageSize = 100;

        public static int ClampPageSize(int pageSize)
        {
            return pageSize <= 0 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);
        }
    }
}
