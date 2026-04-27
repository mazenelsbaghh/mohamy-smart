using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Common.Interface
{
	public interface IAuditService
	{
		void Log(string action, object data);
	}


}
