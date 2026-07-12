using anjk_api.Live;
using anjk_api.Data;
using anjk_api.Entities;
using anjk_api.Repositories;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace anjk_api.Services
{
    public class LiveService : ILiveService
    {
        private readonly AppDbContext _dbContext;
        private readonly IHubContext<LiveHub> _hubContext;
        private readonly IUnitOfWork _unitOfWork;

        public LiveService(AppDbContext dbContext, IHubContext<LiveHub> hubContext, IUnitOfWork unitOfWork)
        {
            _dbContext = dbContext;
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
            return await _dbContext.LiveUpdates
                .AsNoTracking()
                .OrderByDescending(item => item.CreatedOn)
                .Take(take)
                .ToListAsync();
        }
    }
}
