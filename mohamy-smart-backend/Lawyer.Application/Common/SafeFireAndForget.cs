using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Lawyer.Application.Common
{
    public static class SafeFireAndForget
    {
        public static async Task RunAsync(Func<Task> action, ILogger logger, string operationName)
        {
            try
            {
                await action();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Fire-and-forget task '{OperationName}' failed.", operationName);
            }
        }

        public static void Run(Func<Task> action, ILogger logger, string operationName)
        {
            _ = RunAsync(action, logger, operationName);
        }
    }
}
