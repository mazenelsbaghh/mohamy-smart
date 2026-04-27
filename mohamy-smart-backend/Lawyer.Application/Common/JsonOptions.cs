using System.Text.Json;

namespace Lawyer.Application.Common
{
    public static class JsonOptions
    {
        public static readonly JsonSerializerOptions Deserialize = new()
        {
            PropertyNameCaseInsensitive = true,
            AllowTrailingCommas = true
        };

        public static readonly JsonSerializerOptions Serialize = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }
}
