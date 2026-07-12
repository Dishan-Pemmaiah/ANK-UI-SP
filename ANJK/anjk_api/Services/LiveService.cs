using anjk_api.Live;
using anjk_api.Entities;
using anjk_api.Repositories;
using Microsoft.AspNetCore.SignalR;

namespace anjk_api.Services
{
    public class LiveService : ILiveService
    {
        private readonly IHubContext<LiveHub> _hubContext;
        private readonly IUnitOfWork _unitOfWork;

        public LiveService(IHubContext<LiveHub> hubContext, IUnitOfWork unitOfWork)
        {
            _hubContext = hubContext;
            _unitOfWork = unitOfWork;
        }

        public async Task<LiveUpdate> SendLiveMessageAsync(string message)
        {
            var liveUpdate = new LiveUpdate
            {
                Message = message,
                CreatedOn = DateTime.UtcNow
            };

            await _unitOfWork.Repository<LiveUpdate>().AddAsync(liveUpdate);
            await _unitOfWork.CompleteAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveLiveUpdate", liveUpdate.Message);
            return liveUpdate;
        }

        public async Task<LiveUpdate?> GetCurrentAsync()
        {
            var history = await GetHistoryAsync(1);
            return history.FirstOrDefault();
        }

        public async Task<IEnumerable<LiveUpdate>> GetHistoryAsync(int take = 20)
        {
            var updates = await _unitOfWork.Repository<LiveUpdate>().GetAllAsync();
            return updates
                .OrderByDescending(item => item.CreatedOn)
                .Take(take);
        }
    }
}
