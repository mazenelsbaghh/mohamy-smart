using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface IPromptService
    {
        Task<string?> GetPromptIfExistsAsync(string relativePath, CancellationToken ct);
    }
}
