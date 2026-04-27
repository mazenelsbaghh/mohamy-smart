# Research: Phase 2 — Security & Secrets Hardening

## R1: How to configure environment-specific CORS origins in ASP.NET Core

### Decision
Read CORS allowed origins from an `appsettings.json` array (`CorsOrigins`), then pass
them to `policy.WithOrigins(origins)` inside `AddCors()`. Each environment
(`Development`, `Production`) provides its own list via `appsettings.{env}.json` or
environment variables.

### Rationale
- ASP.NET Core's `IConfiguration` supports array binding via repeated keys or JSON arrays.
- Using `builder.Configuration.GetSection("CorsOrigins").Get<string[]>()` is the standard
  approach — no extra NuGet packages needed.
- The policy replaces the current `AllowAnyOrigin()` with `WithOrigins(...)`, which is
  required for `AllowCredentials()` compatibility (ASP.NET Core throws at runtime if both
  `AllowAnyOrigin` and `AllowCredentials` are combined).

### Alternatives Considered
1. **Hardcoded origins in source code** — Rejected: violates FR-001 and Constitution
   Principle I. Changing origins would require a code change and redeployment.
2. **Environment variables only** — Partially applicable: production environments can
   override via `CorsOrigins__0`, `CorsOrigins__1`, etc. But `appsettings.json` provides
   clearer structure for development.
3. **Separate CORS config class** — Overkill for a simple origins list. A string array
   from config is sufficient.

### Implementation Pattern

```csharp
// In WebApplicationServices.cs — AddCors section
var corsOrigins = configuration.GetSection("CorsOrigins").Get<string[]>()
    ?? throw new InvalidOperationException("CorsOrigins is not configured.");

if (corsOrigins.Length == 0)
    throw new InvalidOperationException("CorsOrigins must contain at least one origin.");

services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

```json
// In appsettings.json (Development origins)
"CorsOrigins": [
  "http://localhost:5078",
  "http://localhost:5079",
  "http://localhost:3000"
]
```

```json
// In appsettings.Production.json or environment variables
"CorsOrigins": [
  "https://mohamy-smart.com",
  "https://app.mohamy-smart.com",
  "https://admin.mohamy-smart.com"
]
```

---

## R2: How to validate configuration at startup in ASP.NET Core

### Decision
Add a validation block in `Program.cs` immediately after `WebApplication.CreateBuilder(args)`
and before `builder.Build()`. Use direct `IConfiguration` reads to check required keys.
Fail with `InvalidOperationException` listing all missing/invalid keys at once.

### Rationale
- Validation before `builder.Build()` catches misconfiguration before any DI container
  resolution, database connection, or middleware execution.
- Collecting ALL errors before throwing (rather than fail-on-first) gives the developer
  a complete list of what to fix — saving iteration cycles.
- Format-only checks (no connectivity) keeps startup under 1 second.

### Alternatives Considered
1. **`IStartupFilter`** — Runs after DI is built, so some services (e.g., DbContext)
   may already fail before the filter runs. Too late.
2. **`IValidateOptions<T>`** — Elegant for strongly-typed options but requires defining
   options classes for every config section. Overkill for a simple "are keys present and
   valid?" check.
3. **Health checks (`/health`)** — Wrong tool: health checks run continuously and can
   test connectivity, but they don't prevent startup with broken config.

### Required Keys & Validation Rules

| Key Path | Validation Rule |
|----------|----------------|
| `ConnectionStrings:SqlServer` | Not null, not empty, does not start with "TODO" |
| `JWT:Key` | Not null, length ≥ 32 characters |
| `OpenAI:ApiKey` | Not null, does not start with "TODO" |
| `Gemini:ApiKey` | Not null, does not start with "TODO" |
| `Paymob:APIKey` | Not null, does not start with "TODO" |
| `Paymob:SecretKey` | Not null, does not start with "TODO" |
| `Paymob:PublicKey` | Not null, does not start with "TODO" |
| `Paymob:HMAC` | Not null, does not start with "TODO" |
| `Paymob:CardIntegrationId` | Not null, does not start with "TODO" |
| `Paymob:MobileIntegrationId` | Not null, does not start with "TODO" |
| `Paymob:CallbackBaseUrl` | Not null, valid URL format |
| `CorsOrigins` (section) | Not null, at least one entry, each entry is a valid URL format |
| `FrontendBaseUrl` | Not null, valid URL format |

### Implementation Pattern

```csharp
// In Program.cs, after builder = WebApplication.CreateBuilder(args)
// and before builder.Build()

if (builder.Environment.IsDevelopment())
{
    var errors = new List<string>();

    void CheckRequired(string key, string? value, string? extraRule = null)
    {
        if (string.IsNullOrWhiteSpace(value))
            errors.Add($"Missing required config: '{key}'");
        else if (value.StartsWith("TODO", StringComparison.OrdinalIgnoreCase))
            errors.Add($"Config '{key}' still contains a placeholder value. Set a real value in appsettings.Development.json.");
        else if (extraRule != null)
            errors.Add($"Config '{key}': {extraRule}");
    }

    var config = builder.Configuration;

    CheckRequired("ConnectionStrings:SqlServer", config.GetConnectionString("SqlServer"));

    var jwtKey = config["JWT:Key"];
    if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.StartsWith("TODO"))
        errors.Add("Config 'JWT:Key' is missing or placeholder. Set in appsettings.Development.json.");
    else if (jwtKey.Length < 32)
        errors.Add($"Config 'JWT:Key' must be at least 32 characters (current: {jwtKey.Length}).");

    CheckRequired("OpenAI:ApiKey", config["OpenAI:ApiKey"]);
    CheckRequired("Gemini:ApiKey", config["Gemini:ApiKey"]);
    CheckRequired("Paymob:APIKey", config["Paymob:APIKey"]);
    CheckRequired("Paymob:SecretKey", config["Paymob:SecretKey"]);
    CheckRequired("Paymob:PublicKey", config["Paymob:PublicKey"]);
    CheckRequired("Paymob:HMAC", config["Paymob:HMAC"]);
    CheckRequired("Paymob:CardIntegrationId", config["Paymob:CardIntegrationId"]);
    CheckRequired("Paymob:MobileIntegrationId", config["Paymob:MobileIntegrationId"]);

    // URL format checks
    void CheckUrl(string key, string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.StartsWith("TODO"))
            errors.Add($"Config '{key}' is missing or placeholder.");
        else if (!Uri.TryCreate(value, UriKind.Absolute, out _))
            errors.Add($"Config '{key}' is not a valid URL: '{value}'");
    }

    CheckUrl("Paymob:CallbackBaseUrl", config["Paymob:CallbackBaseUrl"]);
    CheckUrl("FrontendBaseUrl", config["FrontendBaseUrl"]);

    var corsOrigins = config.GetSection("CorsOrigins").Get<string[]>();
    if (corsOrigins == null || corsOrigins.Length == 0)
        errors.Add("Config 'CorsOrigins' is missing or empty. Add at least one origin.");

    if (errors.Count > 0)
    {
        var message = $"""
            ╔══════════════════════════════════════════════════════════════╗
            ║  CONFIGURATION ERROR — Backend cannot start                 ║
            ╠══════════════════════════════════════════════════════════════╣
            ║                                                            ║
            ║  {errors.Count} issue(s) found. Fix in appsettings.Development.json  ║
            ║  (copy from appsettings.example.json if file is missing)   ║
            ║                                                            ║
            ╚══════════════════════════════════════════════════════════════╝

            Issues:
            {string.Join("\n", errors.Select((e, i) => $"  {i + 1}. {e}"))}
            """;
        throw new InvalidOperationException(message);
    }
}
```

---

## R3: Credential rotation strategy

### Decision
Rotate all 6 categories of exposed credentials manually through their respective
management portals. Verify old credentials are rejected. Do NOT rewrite git history.

### Rationale
- The initial commit (`f63a9f2`) contains real values for: DB password (`Zer0_Mohamy`),
  OpenAI key (`sk-proj-...`), Gemini key (`AIzaSy...`), Paymob keys (`egy_sk_test_...`,
  `egy_pk_test_...`), and JWT secret.
- Credential rotation is the industry-standard response to credential exposure.
- Git history rewriting (BFG / filter-branch) would break all existing clones and branches
  — the operational risk exceeds the residual risk of having rotated-and-useless values
  in history.

### Rotation Checklist

| Credential | Where to Rotate | Config Key |
|------------|----------------|------------|
| SQL Server password | SQL Server Management Studio or `ALTER LOGIN` on server 91.108.121.110 | `ConnectionStrings:SqlServer` |
| OpenAI API key | https://platform.openai.com/api-keys — revoke old, generate new | `OpenAI:ApiKey` |
| Gemini API key | https://aistudio.google.com/apikey — revoke old, generate new | `Gemini:ApiKey` |
| Paymob API keys | Paymob merchant portal — regenerate all keys | `Paymob:APIKey`, `Paymob:SecretKey`, `Paymob:PublicKey`, `Paymob:HMAC` |
| Paymob integration IDs | Paymob portal — verify or regenerate | `Paymob:CardIntegrationId`, `Paymob:MobileIntegrationId` |
| JWT signing key | Generate a new 64+ character random string locally | `JWT:Key` |

### Verification Steps
After rotation, for each credential:
1. Extract old value from git history: `git show f63a9f2:mohamy-smart-backend/Lawyer/appsettings.json`
2. Attempt to use old value (DB connection, API call, etc.)
3. Confirm rejection (connection refused, 401, invalid key error)
4. Confirm new value works in `appsettings.Development.json`

---

## R4: CORS policy name change impact

### Decision
Rename the CORS policy from `"AllowAny"` to `"CorsPolicy"`. Update only two locations:
the policy definition in `WebApplicationServices.cs` and the `UseCors()` call in
`Program.cs`.

### Rationale
- The name `"AllowAny"` is misleading after we restrict origins.
- Only `Program.cs` line 137 (`app.UseCors("AllowAny")`) and `WebApplicationServices.cs`
  line 38 (`options.AddPolicy("AllowAny", ...)`) reference the policy name.
- No controllers or other code reference this policy name.

### Alternatives Considered
1. **Keep the name "AllowAny"** — Rejected: misleading after restriction. Would confuse
   future developers.
2. **Use attribute-based CORS** — Overkill: a single global policy is sufficient since
   all endpoints share the same CORS rules.
