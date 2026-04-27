using System;

namespace Lawyer.Application.Common
{
    public class UserContext
    {
        public Guid UserId { get; init; }
        public bool IsAdmin { get; init; }
        public bool IsLawyer { get; init; }
        public string? ClientIp { get; init; }
    }
}
