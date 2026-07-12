namespace anjk_api.Services
{
    public interface ILiveService
    {
        Task<anjk_api.Entities.LiveUpdate> SendLiveMessageAsync(string message);
        Task<anjk_api.Entities.LiveUpdate?> GetCurrentAsync();
        Task<IEnumerable<anjk_api.Entities.LiveUpdate>> GetHistoryAsync(int take = 20);
    }
}