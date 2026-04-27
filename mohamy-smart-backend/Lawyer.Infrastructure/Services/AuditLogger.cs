using Lawyer.Application.Common.Interface;
using Serilog;

namespace Lawyer.Infrastructure.Services
{
	public class AuditService : IAuditService
	{
		private readonly Serilog.ILogger _logger;

		public AuditService()
		{
			_logger = Serilog.Log.ForContext("IsAudit", true);
		}

		public void Log(string action, object data)
		{
			_logger.Information("AUDIT: {Action} - {@Data}", action, data);
		}
	}
}
