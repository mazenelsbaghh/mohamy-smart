namespace Lawyer.Application.Common
{
    public interface IUserContextProvider
    {
        UserContext GetCurrentContext();
    }
}
