using Microsoft.AspNetCore.SignalR;

namespace anjk_api.Live
{
    public class LiveHub : Hub
    {
        public async Task SendLiveUpdate(string message)
        {
            await Clients.All.SendAsync("ReceiveLiveUpdate", message);
        }
    }
}
