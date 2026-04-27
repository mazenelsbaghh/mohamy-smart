using Lawyer.Application.Common.Interface;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Infrastructure.Services
{
	public class DateTimeProvider : IDateTimeProvider
	{
		private readonly TimeZoneInfo _timeZone;

		public DateTimeProvider(IConfiguration config)
		{
			var tzId = config["AppSettings:TimeZoneId"]
					   ?? (RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
						   ? "Arab Standard Time"
						   : "Asia/Riyadh");

			_timeZone = TimeZoneInfo.FindSystemTimeZoneById(tzId);
		}

		public DateTime UtcNow => DateTime.UtcNow;

		public DateTime ToLocal(DateTime utcDateTime) =>
			TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, _timeZone);

		public DateTime ToUtc(DateTime localTime) =>
			TimeZoneInfo.ConvertTimeToUtc(localTime, _timeZone);


	}

}
