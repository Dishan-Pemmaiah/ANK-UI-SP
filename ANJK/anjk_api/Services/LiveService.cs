using anjk_api.Live;
using Microsoft.AspNetCore.SignalR;

namespace anjk_api.Services
{
    public class LiveService : ILiveService
    {
        private readonly IHubContext<LiveHub> _hubContext;

        public LiveService(IHubContext<LiveHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendLiveMessageAsync(string message)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveLiveUpdate", message);
        }
    }
}
