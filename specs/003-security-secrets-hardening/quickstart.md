# Quickstart: Phase 2 — Security & Secrets Hardening

## Prerequisites

- Phase 1 (Environment & Port Unification) is complete
- `appsettings.Development.json` exists with valid credentials
- Access to third-party service portals for credential rotation

## Step 1: Add CorsOrigins to appsettings.json

Open `mohamy-smart-backend/Lawyer/appsettings.json` and add the `CorsOrigins` array:

```json
"CorsOrigins": [
  "http://localhost:5078",
  "http://localhost:5079",
  "http://localhost:3000"
]
```

## Step 2: Restrict CORS in WebApplicationServices.cs

Replace the `AllowAny` CORS policy in
`mohamy-smart-backend/Lawyer/Extensions/WebApplicationServices.cs`:

**Before:**
```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowAny", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

**After:**
```csharp
var corsOrigins = configuration.GetSection("CorsOrigins").Get<string[]>()
    ?? throw new InvalidOperationException("CorsOrigins is not configured in appsettings.json.");

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

## Step 3: Update UseCors in Program.cs

In `mohamy-smart-backend/Lawyer/Program.cs`, line 137:

**Before:** `app.UseCors("AllowAny");`
**After:** `app.UseCors("CorsPolicy");`

## Step 4: Add startup config validation

In `Program.cs`, after `var builder = WebApplication.CreateBuilder(args);` (line 18),
add the validation block (see `research.md` R2 for full implementation).

## Step 5: Create appsettings.example.json

Create `mohamy-smart-backend/Lawyer/appsettings.example.json` with placeholder values
for every secret. Commit this file.

## Step 6: Rotate all credentials

See `research.md` R3 for the full rotation checklist:
1. SQL Server password → `ALTER LOGIN` on 91.108.121.110
2. OpenAI API key → platform.openai.com → revoke old, generate new
3. Gemini API key → aistudio.google.com → revoke old, generate new
4. Paymob keys → Paymob portal → regenerate all
5. JWT secret → generate new 64+ character random string

## Step 7: Verify

1. Start backend: `cd mohamy-smart-backend/Lawyer && dotnet run`
2. Test CORS with curl:
   ```bash
   # Should succeed (allowed origin)
   curl -I -H "Origin: http://localhost:5078" http://localhost:8976/api/Auth/login
   # Check for: Access-Control-Allow-Origin: http://localhost:5078

   # Should fail (unknown origin)
   curl -I -H "Origin: http://evil.com" http://localhost:8976/api/Auth/login
   # Check: NO Access-Control-Allow-Origin header
   ```
3. Test startup validation: rename `appsettings.Development.json` → run `dotnet run` →
   should fail with descriptive error listing all missing keys.
4. Test old credentials: extract from git history → verify they're rejected.
