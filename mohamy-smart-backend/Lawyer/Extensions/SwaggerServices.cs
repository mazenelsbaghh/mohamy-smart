using Microsoft.OpenApi.Models;
using System.Reflection;

namespace Lawyer.API.Extensions
{
    public static class SwaggerServices
    {
        public static IServiceCollection AddSwaggerServices(this IServiceCollection services)
        {
			services.AddEndpointsApiExplorer();

			services.AddSwaggerGen(c =>
			{
				c.SwaggerDoc("v1", new OpenApiInfo
				{
					Title = "Lawyer API",
					Version = "v1",
					Description = "محامي سمارت - REST API for the Mohamy Smart platform",
				});

				// Include XML comments for API documentation
				var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
				var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
				if (File.Exists(xmlPath))
				{
					c.IncludeXmlComments(xmlPath);
				}

				c.AddSecurityDefinition("BearerAuth", new OpenApiSecurityScheme
				{
					In = ParameterLocation.Header,
					Description = "Please enter JWT token",
					Name = "Authorization",
					Type = SecuritySchemeType.Http,
					Scheme = "bearer",
					BearerFormat = "JWT"
				});

				c.AddSecurityRequirement(new OpenApiSecurityRequirement
				{
					{
						new OpenApiSecurityScheme
						{
							Reference = new OpenApiReference
							{
								Type = ReferenceType.SecurityScheme,
								Id = "BearerAuth"
							}
						},
						new string[] {}
					}
				});
			});

			return services;
        }
    }
}
