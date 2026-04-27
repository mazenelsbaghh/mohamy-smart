using System.Collections.Concurrent;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;

namespace Lawyer.Application.Common
{
    public class PromptTemplateCache
    {
        private readonly ConcurrentDictionary<string, Task<string>> _cache = new();
        private readonly string _contentRootPath;

        public PromptTemplateCache(IHostEnvironment env)
        {
            _contentRootPath = env.ContentRootPath;
        }

        public PromptTemplateCache(string contentRootPath)
        {
            _contentRootPath = contentRootPath;
        }

        public Task<string> GetAsync(string relativePath, CancellationToken ct)
        {
            return _cache.GetOrAdd(relativePath, _ => File.ReadAllTextAsync(
                Path.Combine(_contentRootPath, "wwwroot", "prompts", relativePath), ct));
        }
    }
}
