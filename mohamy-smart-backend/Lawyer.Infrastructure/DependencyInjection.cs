using Lawyer.Application.Common.Interface;
using Lawyer.Application.IServices;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Lawyer.Core.Setting;
using Lawyer.Infrastructure.Persistence;
using Lawyer.Infrastructure.Persistence.Repositories;
using Lawyer.Infrastructure.Repositories;
using Lawyer.Infrastructure.Services;
using Lawyer.Infrastructure.Services.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Infrastructure
{
	public static class DependencyInjection
	{
		public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
		{

			services.AddSingleton<AuditInterceptor>();

		services.AddDbContext<AppDbContext>((sp, options) =>
			{
				options.UseSqlServer(
				configuration.GetConnectionString("SqlServer"),
				sqlOptions => sqlOptions.EnableRetryOnFailure(
					maxRetryCount: 5,
					maxRetryDelay: TimeSpan.FromSeconds(10),
					errorNumbersToAdd: new[] { 1205 } // 1205 = Deadlock victim
				));
				options.AddInterceptors(sp.GetRequiredService<AuditInterceptor>());
			});


		 
			services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
			services.AddScoped<IUnitOfWork, UnitOfWork>();
			services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();

			services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<AppDbContext>());

			services.Configure<JWT>(configuration.GetSection("Jwt"));
			services.Configure<AppSetting>(configuration.GetSection("AppSetting"));
			services.AddScoped<ITokenService, TokenService>();
			services.AddScoped<IFileUploadService, FileUploadService>();
			services.AddScoped<IFileService, FileService>();
			services.AddScoped<IAuditService, Lawyer.Infrastructure.Services.AuditService>();





			services.AddSingleton<IDateTimeProvider, DateTimeProvider>();


			// Email settings and service
			services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
			services.Configure<SmsSettings>(configuration.GetSection("SmsSettings"));
			services.AddScoped<Lawyer.Application.IServices.IEmailService, Lawyer.Infrastructure.Services.EmailService>();
			
			services.AddHttpClient("PlusSms").RemoveAllLoggers();
			services.AddScoped<ISmsSender, PlusSmsSender>();

			services.AddHttpContextAccessor();


			return services;
		
		}



	}

}
