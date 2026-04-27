using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface ISmsSender
    {
        Task<bool> SendOtpAsync(string phoneNumber, string message, string relatedBusinessId, CancellationToken cancellationToken = default);
    }
}
