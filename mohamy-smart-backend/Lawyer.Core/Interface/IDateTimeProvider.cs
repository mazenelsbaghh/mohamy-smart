using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Common.Interface
{
	public interface IDateTimeProvider
	{
		DateTime UtcNow { get; }
		DateTime ToLocal(DateTime utcDateTime);
		DateTime ToUtc(DateTime localTime);
	}

}
