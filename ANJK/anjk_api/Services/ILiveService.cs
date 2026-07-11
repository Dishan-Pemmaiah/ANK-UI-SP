namespace anjk_api.Services
{
    public interface ILiveService
    {
        Task SendLiveMessageAsync(string message);
    }
}