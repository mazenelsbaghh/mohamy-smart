using Lawyer.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;
using System.IO;

namespace Lawyer.Infrastructure.Persistence
{
	public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
	{
		public AppDbContext CreateDbContext(string[] args)
		{
			var config = new ConfigurationBuilder()
				.SetBasePath(Directory.GetCurrentDirectory()) // this line requires FileExtensions
				.AddJsonFile("appsettings.json", optional: false)
				.AddJsonFile("appsettings.Development.json", optional: true)
				.AddEnvironmentVariables()
				.Build();

			var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
			optionsBuilder.UseSqlServer(config.GetConnectionString("SqlServer"));

			return new AppDbContext(optionsBuilder.Options);
		}
	}
}
