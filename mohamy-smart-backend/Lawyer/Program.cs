

using Lawyer.API.Extensions;
using Lawyer.API.Middlewares;
using Lawyer.Application;
using Lawyer.Application.Common;
using Lawyer.Application.IServices;
using Lawyer.Core.Models;
using Lawyer.Hubs;
using Lawyer.Infrastructure;
using Lawyer.Infrastructure.Persistence;
using Lawyer.Services;
using Lawyer.Application.Services;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;
using Hangfire;
using Hangfire.SqlServer;
using Polly;
using Polly.Extensions.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using QuestPDF.Drawing;
using QuestPDF.Infrastructure;
using Scalar.AspNetCore;
using Serilog;
using FluentValidation;
using System.Linq;
using System.Threading.RateLimiting;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 25L * 1024 * 1024;
});

// ── Sentry error monitoring ───────────────────────────────────────────
var sentryDsn = builder.Configuration["Sentry:Dsn"];
var hasUsableSentryDsn = !string.IsNullOrWhiteSpace(sentryDsn) &&
    !sentryDsn.StartsWith("TODO", StringComparison.OrdinalIgnoreCase) &&
    !sentryDsn.Contains("YOUR_", StringComparison.OrdinalIgnoreCase) &&
    Uri.TryCreate(sentryDsn, UriKind.Absolute, out _);

if (hasUsableSentryDsn)
{
	builder.WebHost.UseSentry(o =>
	{
		o.Dsn = sentryDsn;
		o.Environment = builder.Configuration["Sentry:Environment"] ?? builder.Environment.EnvironmentName;
		o.TracesSampleRate = double.TryParse(builder.Configuration["Sentry:TracesSampleRate"], out var rate) ? rate : 0.2;
		o.SendDefaultPii = false;
	});
}

// ── Startup Config Validation (Development only) ──────────────────────
if (builder.Environment.IsDevelopment())
{
    var errors = new List<string>();
    var cfg = builder.Configuration;

    static bool IsPlaceholder(string? v) =>
        string.IsNullOrWhiteSpace(v) ||
        v.StartsWith("TODO", StringComparison.OrdinalIgnoreCase) ||
        v.Contains("YOUR_", StringComparison.OrdinalIgnoreCase);

    void CheckRequired(string key, string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            errors.Add($"Missing required config: '{key}'");
        else if (IsPlaceholder(value))
            errors.Add($"Config '{key}' still contains a placeholder. Set a real value via environment variables or appsettings.Development.json.");
    }

    void CheckOptionalExternal(string key, string? value)
    {
        if (IsPlaceholder(value))
            Log.Warning("Config '{ConfigKey}' is placeholder in Development. Related integrations will fail until a real value is provided.", key);
    }

    void CheckUrl(string key, string? value)
    {
        if (IsPlaceholder(value))
            errors.Add($"Config '{key}' is missing or placeholder.");
        else if (!Uri.TryCreate(value, UriKind.Absolute, out _))
            errors.Add($"Config '{key}' is not a valid URL: '{value}'");
    }

    // Database
    CheckRequired("ConnectionStrings:SqlServer", cfg.GetConnectionString("SqlServer"));

    // JWT
	var jwtKey = cfg["JWT:Key"];
	if (IsPlaceholder(jwtKey))
		errors.Add("Config 'JWT:Key' is missing or placeholder. Set it via environment variables or appsettings.Development.json.");
	else if (jwtKey is { Length: < 32 })
		errors.Add($"Config 'JWT:Key' must be at least 32 characters (current: {jwtKey.Length}).");

    // External integrations are allowed to be placeholders in local Development.
    // The application can still boot so non-AI/payment flows remain testable.
    CheckOptionalExternal("Gemini:ApiKey", cfg["Gemini:ApiKey"]);
    CheckOptionalExternal("GoogleVision:ApiKey", cfg["GoogleVision:ApiKey"]);

    // Paymob
    CheckOptionalExternal("Paymob:APIKey", cfg["Paymob:APIKey"]);
    CheckOptionalExternal("Paymob:SecretKey", cfg["Paymob:SecretKey"]);
    CheckOptionalExternal("Paymob:PublicKey", cfg["Paymob:PublicKey"]);
    CheckOptionalExternal("Paymob:HMAC", cfg["Paymob:HMAC"]);
    CheckOptionalExternal("Paymob:CardIntegrationId", cfg["Paymob:CardIntegrationId"]);
    CheckOptionalExternal("Paymob:MobileIntegrationId", cfg["Paymob:MobileIntegrationId"]);
    if (!IsPlaceholder(cfg["Paymob:CallbackBaseUrl"]))
        CheckUrl("Paymob:CallbackBaseUrl", cfg["Paymob:CallbackBaseUrl"]);

    // CORS & Frontend
    CheckUrl("FrontendBaseUrl", cfg["FrontendBaseUrl"]);
    var corsOrigins = cfg.GetSection("CorsOrigins").Get<string[]>();
    if (corsOrigins == null || corsOrigins.Length == 0)
        errors.Add("Config 'CorsOrigins' is missing or empty. Add at least one origin in appsettings.json.");

    if (errors.Count > 0)
    {
        var message = string.Join(Environment.NewLine,
            "╔══════════════════════════════════════════════════════════════╗",
            "║  CONFIGURATION ERROR — Backend cannot start                 ║",
            "╠══════════════════════════════════════════════════════════════╣",
            $"║  {errors.Count} issue(s) found.                                       ║",
            "║  Fix via .env.docker or appsettings.Development.json       ║",
            "║  (Docker uses .env.docker; local dotnet uses appsettings)  ║",
            "╚══════════════════════════════════════════════════════════════╝",
            "",
            "Issues:",
            string.Join(Environment.NewLine, errors.Select((e, i) => $"  {i + 1}. {e}"))
        );
        throw new InvalidOperationException(message);
    }
}



// ── Production integration validation ─────────────────────────────────
// In Production, external integration keys (Paymob, Gemini, GoogleVision) must be real —
// never placeholders or obviously non-production values. Failing fast at startup prevents
// running real traffic against test merchant accounts or empty AI quotas.
if (builder.Environment.IsProduction())
{
    static bool IsBadProdValue(string? v) =>
        string.IsNullOrWhiteSpace(v)
        || v.StartsWith("TODO", StringComparison.OrdinalIgnoreCase)
        || v.Contains("YOUR_", StringComparison.OrdinalIgnoreCase)
        || v.Contains("placeholder", StringComparison.OrdinalIgnoreCase);

    var prodErrors = new List<string>();
    foreach (var key in new[]
    {
        "Paymob:APIKey", "Paymob:SecretKey", "Paymob:PublicKey", "Paymob:HMAC",
        "Paymob:CardIntegrationId", "Paymob:MobileIntegrationId", "Paymob:CallbackBaseUrl",
        "Gemini:ApiKey", "GoogleVision:ApiKey",
    })
    {
        if (IsBadProdValue(builder.Configuration[key]))
            prodErrors.Add($"Config '{key}' is missing, placeholder, or contains 'test' in Production.");
    }

    if (prodErrors.Count > 0)
        throw new InvalidOperationException(
            "Production startup failed — refusing to boot with unsafe integration keys:\n"
            + string.Join("\n", prodErrors.Select(e => $"  - {e}")));
}

// Add services to the container.

builder.Services.AddHttpClient();
builder.Services.AddHttpClient("Gemini", client =>
{
    client.Timeout = TimeSpan.FromMinutes(5);
})
.AddTransientHttpErrorPolicy(p => p.WaitAndRetryAsync(
    3,
    attempt => TimeSpan.FromMilliseconds(500 * Math.Pow(2, attempt))))
.AddTransientHttpErrorPolicy(p => p.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));
builder.Services.AddHttpClient("OpenAI", client =>
{
    client.Timeout = TimeSpan.FromMinutes(5);
})
.AddTransientHttpErrorPolicy(p => p.WaitAndRetryAsync(
    3,
    attempt => TimeSpan.FromMilliseconds(500 * Math.Pow(2, attempt))))
.AddTransientHttpErrorPolicy(p => p.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));
builder.Services.AddHttpClient("Paymob", client =>
{
	client.BaseAddress = new Uri("https://accept.paymob.com/");
});
builder.Services.Configure<Lawyer.Core.Setting.PaymobSettings>(builder.Configuration.GetSection("Paymob"));

builder.Services.AddWebApplicationServices(builder.Configuration, builder.Environment);

builder.Services.AddOutputCache();

builder.Services
	.AddApplication()
	.AddInfrastructure(builder.Configuration);

if (!builder.Environment.IsEnvironment("Testing") && builder.Configuration.GetConnectionString("SqlServer") != null)
{
	builder.Services.AddHangfire(config => config
		.SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
		.UseSimpleAssemblyNameTypeSerializer()
		.UseRecommendedSerializerSettings()
		.UseSqlServerStorage(builder.Configuration.GetConnectionString("SqlServer") ?? "Server=(localdb)\\mssqllocaldb;Database=dummy;Trusted_Connection=True;",
			new SqlServerStorageOptions
			{
				CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
				SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
				QueuePollInterval = TimeSpan.Zero,
				UseRecommendedIsolationLevel = true,
				DisableGlobalLocks = true,
			}));
	builder.Services.AddHangfireServer();
}

builder.Services.AddSignalR();
builder.Services.AddHealthChecks();

// FluentValidation auto-validation for incoming MVC/DTO payloads
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssembly(typeof(Lawyer.Application.Validators.AgendaItemDtoValidator).Assembly);

builder.Services.AddScoped<IAiJobNotificationService, AiJobNotificationService>();
builder.Services.AddScoped<IVirusScannerService, VirusScannerService>();
builder.Services.AddScoped<IUserContextProvider, HttpUserContextProvider>();
builder.Services.AddHostedService<Lawyer.API.Extensions.GeminiHealthCheck>();

builder.Host.UseSerilog((context, services, configuration) =>
{
	var httpAccessor = services.GetRequiredService<IHttpContextAccessor>();

	configuration
		.ReadFrom.Configuration(context.Configuration)
		.ReadFrom.Services(services);
	//.Enrich.With(new UserIdEnricher(httpAccessor)


});



builder.Services.AddRateLimiter(options =>
{
	options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

	options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
		RateLimitPartition.GetFixedWindowLimiter(
			partitionKey: context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
			factory: _ => new FixedWindowRateLimiterOptions
			{
				PermitLimit = 200,
				Window = TimeSpan.FromMinutes(1),
				QueueLimit = 0,
				AutoReplenishment = true
			}));

	options.AddPolicy("auth", context =>
		RateLimitPartition.GetFixedWindowLimiter(
			partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
			factory: _ => new FixedWindowRateLimiterOptions
			{
				PermitLimit = 100,
				Window = TimeSpan.FromMinutes(1),
				QueueLimit = 0,
				AutoReplenishment = true
			}));

	options.AddPolicy("otp", context =>
		RateLimitPartition.GetFixedWindowLimiter(
			partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
			factory: _ => new FixedWindowRateLimiterOptions
			{
				PermitLimit = 10,
				Window = TimeSpan.FromMinutes(1),
				QueueLimit = 0,
				AutoReplenishment = true
			}));

	options.AddPolicy("AiEndpoints", context =>
		RateLimitPartition.GetFixedWindowLimiter(
			partitionKey: context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
			factory: _ => new FixedWindowRateLimiterOptions
			{
				PermitLimit = 60,
				Window = TimeSpan.FromMinutes(1),
				QueueLimit = 0,
				AutoReplenishment = true
			}));

	options.AddPolicy("OcrEndpoints", context =>
		RateLimitPartition.GetFixedWindowLimiter(
			partitionKey: context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
			factory: _ => new FixedWindowRateLimiterOptions
			{
				// OCR calls are expensive AI operations; 50/min/user is generous for legitimate use
				// and protects the Google Vision quota from runaway loops or abuse.
				PermitLimit = 50,
				Window = TimeSpan.FromMinutes(1),
				QueueLimit = 0,
				AutoReplenishment = true
			}));

	options.AddPolicy("upload", context =>
		RateLimitPartition.GetFixedWindowLimiter(
			partitionKey: context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
			factory: _ => new FixedWindowRateLimiterOptions
			{
				PermitLimit = 20,
				Window = TimeSpan.FromMinutes(1),
				QueueLimit = 0,
				AutoReplenishment = true
			}));

	options.AddPolicy("contact", context =>
		RateLimitPartition.GetFixedWindowLimiter(
			partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
			factory: _ => new FixedWindowRateLimiterOptions
			{
				PermitLimit = 5,
				Window = TimeSpan.FromMinutes(1),
				QueueLimit = 0,
				AutoReplenishment = true
			}));
});


QuestPDF.Settings.License = LicenseType.Community;

string ResolveFontPath(string fileName)
{
    var candidatePaths = new[]
    {
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "Fonts", fileName),
        Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "Lawyer", "wwwroot", "Fonts", fileName))
    };

    var existingPath = candidatePaths.FirstOrDefault(File.Exists);
    return existingPath ?? throw new FileNotFoundException($"QuestPDF font file was not found: {fileName}");
}

var _fontStreams = new List<FileStream>
{
    File.OpenRead(ResolveFontPath("Tajawal-Regular.ttf")),
    File.OpenRead(ResolveFontPath("Tajawal-Bold.ttf"))
};
foreach (var stream in _fontStreams)
{
    FontManager.RegisterFont(stream);
}

var app = builder.Build();

app.Lifetime.ApplicationStopping.Register(() =>
{
    foreach (var s in _fontStreams) s.Dispose();
});

#region Seeding
using (var scope = app.Services.CreateScope())
{
	var services = scope.ServiceProvider;

	try
	{
		var roleManager = services.GetRequiredService<RoleManager<Role>>();
		var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
		var configuration = services.GetRequiredService<IConfiguration>();
		var seedLogger = services.GetRequiredService<ILogger<DataSeed>>();
		
		// Note: We do NOT invoke context.Database.Migrate() here.
		// Schema changes must be applied explicitly via 'make migrate'.
		await DataSeed.SeedBaselineAsync(roleManager, userManager, configuration, seedLogger);
	}
	catch (Exception ex)
	{
		var logger = services.GetRequiredService<ILogger<Program>>();
		logger.LogCritical(ex, "FATAL: Pre-flight database seeding failed. The application will not start.");
		throw;
	}
}
#endregion


app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<RequestTimingMiddleware>();
app.UseCustomExceptionHandling();

// Security headers — applied to every response
app.Use(async (ctx, next) =>
{
	var headers = ctx.Response.Headers;
	headers["X-Content-Type-Options"] = "nosniff";
	headers["X-Frame-Options"] = "DENY";
	headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
	headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
	if (!ctx.Request.Path.StartsWithSegments("/hangfire"))
	{
		headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; base-uri 'self'";
	}
	await next();
});

if (!app.Environment.IsDevelopment())
{
	// HSTS with preload + includeSubDomains — the stricter form required for browser preload lists.
	app.UseHsts();
	app.Use(async (ctx, next) =>
	{
		ctx.Response.Headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
		await next();
	});
}

if (app.Environment.IsDevelopment())
{
	// Serve the OpenAPI JSON
	app.UseSwagger(); // exposes /swagger/v1/swagger.json by default

	app.MapScalarApiReference(options =>
	{
		options
			.WithTitle("Lawyer API")
			.WithTheme(ScalarTheme.Saturn)

			// Link Scalar to the OpenAPI document
			.AddDocument("v1", "Lawyer API", "/swagger/v1/swagger.json")

			// Add Bearer authentication
			.AddPreferredSecuritySchemes("BearerAuth")
			.AddHttpAuthentication("BearerAuth", auth =>
			{
				auth.Token = "your-jwt-token-here"; // optional for dev only
			});
	});
}


app.UseHttpsRedirection();
app.UseCors("CorsPolicy");
app.UseOutputCache();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
// T003: antiforgery is enforced via JsonAutoValidateAntiforgeryFilter (MVC global filter).
// UseAntiforgery() is NOT used — it targets Minimal APIs / Razor Pages and would double-validate,
// returning an empty-body 400 that the frontend cannot detect as a CSRF error.

app.UseStaticFiles();

app.MapControllers();
app.MapHealthChecks("/health");

app.MapHub<AiJobHub>("/hubs/ai-jobs");

if (!app.Environment.IsEnvironment("Testing"))
{
	app.UseHangfireDashboard("/hangfire", new DashboardOptions
	{
		Authorization = new[] { new Lawyer.Filters.HangfireAuthorizationFilter() }
	});
}

app.Run();

public partial class Program;
