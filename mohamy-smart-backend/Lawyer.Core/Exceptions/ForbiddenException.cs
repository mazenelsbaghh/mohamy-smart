using System;

namespace Lawyer.Core.Exceptions
{
    public class ForbiddenException : Exception
    {
        public ForbiddenException() : base("ليس لديك صلاحية للوصول إلى هذا المورد.") { }

        public ForbiddenException(string message) : base(message) { }

        public ForbiddenException(string message, Exception innerException) : base(message, innerException) { }
    }
}
