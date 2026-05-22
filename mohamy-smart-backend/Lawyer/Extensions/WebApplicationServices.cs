using Lawyer.API.Extensions;
using Lawyer.API.Factories;

//using Lawyer.API.Enrichers;
using Lawyer.Core.Models;
using Lawyer.Core.Setting;
using Lawyer.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Serilog.Core;
using System.Text;

namespace Lawyer.API.Extensions
{
    public static class WebApplicationServices
    {
        public static IServiceCollection AddWebApplicationServices(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
        {


            // ── Data Protection key persistence ────────────────────────────────────
            // Keys are written to /app/DataProtectionKeys which is mounted as a Docker
            // volume.  Without this, every container restart generates a new ephemeral
            // key ring, making all XSRF tokens and httpOnly session cookies unreadable
            // (CryptographicException: key not found in key ring).
            var dpKeysPath = configuration["DataProtection:KeysPath"];
            if (string.IsNullOrEmpty(dpKeysPath))
            {
                dpKeysPath = environment.IsEnvironment("Testing")
                    ? Path.Combine(Path.GetTempPath(), "MohamySmart_Test_DPKeys")
                    : "/app/DataProtectionKeys";
            }
            services.AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo(dpKeysPath))
                .SetApplicationName("MohamySmartApi");

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            //services.AddSingleton<ILogEventEnricher, UserIdEnricher>();



            services.Configure<FormOptions>(options =>
            {
                options.MultipartBodyLengthLimit = 200L * 1024 * 1024; // 200MB
            });


            var corsOrigins = configuration.GetSection("CorsOrigins").Get<string[]>()
                ?? throw new InvalidOperationException(
                    "CorsOrigins is not configured in appsettings.json. " +
                    "Add a \"CorsOrigins\" array with at least one allowed origin.");

            if (corsOrigins.Length == 0)
                throw new InvalidOperationException(
                    "CorsOrigins must contain at least one origin. " +
                    "Example: [\"http://localhost:5078\", \"http://localhost:5079\"]");

            if (corsOrigins.Contains("*"))
                throw new InvalidOperationException(
                    "SECURITY ERROR: CorsOrigins cannot contain the wildcard '*'. " +
                    "Using '*' with credentials or in production is a severe vulnerability. " +
                    "Please specify exact allowed origins in appsettings.");

            // Credentialed CORS (cookies) over plain HTTP in production is a cookie-leak vector.
            // Any http:// origin is rejected outside Development and Testing.
            if (!environment.IsDevelopment() && !environment.IsEnvironment("Testing"))
            {
                var insecureOrigins = corsOrigins.Where(o => o.StartsWith("http://", StringComparison.OrdinalIgnoreCase)).ToArray();
                if (insecureOrigins.Length > 0)
                    throw new InvalidOperationException(
                        "CorsOrigins contains plain-HTTP origin(s) while AllowCredentials is enabled: " +
                        string.Join(", ", insecureOrigins) +
                        ". Use HTTPS origins in non-Development environments.");
            }

            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", policy =>
                {
                    policy.WithOrigins(corsOrigins)
                          .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                          .WithHeaders(
                              "Authorization",
                              "Content-Type",
                              "Accept",
                              "X-Requested-With",
                              "X-Correlation-Id",
                              "X-XSRF-TOKEN",       // T002: required for CSRF double-submit
                              "X-SignalR-User-Agent") // required for SignalR hub negotiate/connect
                          .WithExposedHeaders("X-Correlation-Id")
                          .AllowCredentials()      // already present — credentials needed for cookies
                          .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
                });
            });

            // T001: antiforgery — double-submit cookie pattern
            // XSRF-TOKEN cookie is NOT httpOnly so Axios can read and echo it in X-XSRF-TOKEN header.
            services.AddAntiforgery(opts =>
            {
                opts.HeaderName = "X-XSRF-TOKEN";
                opts.Cookie.Name = "XSRF-TOKEN";
                opts.Cookie.HttpOnly = false;            // JS must read this value
                opts.Cookie.SameSite = SameSiteMode.Lax;
                opts.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; // Secure in prod via HTTPS
            });
            services.AddScoped<Lawyer.Filters.JsonAutoValidateAntiforgeryFilter>();
            services.AddScoped<Lawyer.Filters.RequireBrowserOtpRequestFilter>();
            services.AddControllersWithViews(options =>
        {
            options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;

            // T031: Apply CSRF validation globally to all state-changing requests
            // (POST, PUT, PATCH, DELETE). GET/HEAD/OPTIONS are safe methods and are
            // automatically excluded by the filter.
            // Endpoints that are legitimately exempt (e.g. unauthenticated login, Paymob webhook)
            // must carry [IgnoreAntiforgeryToken] explicitly.
            //
            // Uses JsonAutoValidateAntiforgeryFilter instead of the stock
            // AutoValidateAntiforgeryTokenAttribute so that CSRF failures return a JSON body
            // containing the keyword "antiforgery" — enabling the frontend CSRF retry interceptor
            // to detect and auto-recover.
            options.Filters.AddService<Lawyer.Filters.JsonAutoValidateAntiforgeryFilter>();
        }).AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        });

            services.Configure<ApiBehaviorOptions>(options =>
            {
                options.InvalidModelStateResponseFactory = ApiResponseFactory.CustomValidationErrorResponse;
            });

            ConfigureJWT(services, configuration, environment);
            services.AddAuthorization();
            services.AddSwaggerServices();

            return services;
        }

        private static void ConfigureJWT(IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
        {
            var jwt = configuration.GetSection("JWT").Get<JWT>()
                ?? throw new InvalidOperationException("JWT configuration section is missing.");

            // Enforce JWT key strength in every environment, not just Development.
            // A weak key in staging/production is a silent cryptographic vulnerability.
            if (string.IsNullOrWhiteSpace(jwt.Key) || jwt.Key.Length < 32)
                throw new InvalidOperationException(
                    $"JWT:Key must be at least 32 characters (current: {jwt.Key?.Length ?? 0}). " +
                    "Configure a strong secret in appsettings or the JWT__Key environment variable.");

            services.AddIdentity<ApplicationUser, Role>(options =>
            {
                // Sign-in settings
                options.SignIn.RequireConfirmedAccount = false;

                // Password settings
                options.Password.RequireDigit = true; // Password must have at least one digit
                options.Password.RequiredLength = 8; // Minimum length of 8 characters
                options.Password.RequireNonAlphanumeric = true; // Password must have at least one special character
                options.Password.RequireUppercase = true; // Password must have at least one uppercase letter
                options.Password.RequireLowercase = true; // Password must have at least one lowercase letter
                options.Password.RequiredUniqueChars = 0; // At least one unique character
                options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_@.";

                // Lockout settings
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
                options.Lockout.AllowedForNewUsers = true;
            })
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();


            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer();

            services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
                .Configure<IOptions<JWT>>((o, jwtOptions) =>
                {
                    var jwtSetting = jwtOptions.Value;
                    o.RequireHttpsMetadata = !environment.IsDevelopment();
                    o.SaveToken = false;
                    o.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = jwtSetting.Issuer,

                        ValidateAudience = true,
                        ValidAudience = jwtSetting.Audience,

                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSetting.Key)),
                        ClockSkew = TimeSpan.FromSeconds(30)
                    };
                    o.Events = new JwtBearerEvents
                    {
                        // T006: Read JWT from httpOnly session cookie when no Authorization header is present.
                        // Covers both API requests and the SignalR hub WebSocket upgrade.
                        // The ?access_token= query-string fallback is removed — it logs tokens in proxy access logs.
                        OnMessageReceived = context =>
                        {
                            if (string.IsNullOrEmpty(context.Token))
                            {
                                // Production uses __Host- prefix (enforces Secure + Path=/ + no Domain)
                                var cookie = context.Request.Cookies["__Host-session"]
                                    ?? context.Request.Cookies["session"];
                                if (!string.IsNullOrEmpty(cookie))
                                    context.Token = cookie;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });
        }
    }
}
