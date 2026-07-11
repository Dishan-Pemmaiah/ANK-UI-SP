using anjk_api.Live;
using anjk_api.Models.Dtos;
using anjk_api.Repositories;
using anjk_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace anjk_api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class LiveController : ControllerBase
    {
        private readonly ILiveService _liveService;
        private readonly IUnitOfWork _unitOfWork;

        public LiveController(ILiveService liveService, IUnitOfWork unitOfWork)
        {
            _liveService = liveService;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetStatus()
        {
            // Simple static status placeholder; extend this with real live match data later.
            return Ok(new
            {
                title = "Live match tracker",
                description = "Track the current match and broadcast updates from the admin portal.",
                teamA = "Anjigeri Stars",
                teamB = "Guest Team",
                scoreA = 0,
                scoreB = 0,
                liveStatus = "Awaiting live updates"
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("broadcast")]
        public async Task<IActionResult> Broadcast([FromBody] LiveBroadcastDto dto)
        {
            await _liveService.SendLiveMessageAsync(dto.Message);
            return Ok();
        }
    }
}
