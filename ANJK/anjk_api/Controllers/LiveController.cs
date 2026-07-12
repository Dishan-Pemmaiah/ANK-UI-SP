using anjk_api.Live;
using anjk_api.Models.Dtos;
using anjk_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace anjk_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LiveController : ControllerBase
    {
        private readonly ILiveService _liveService;

        public LiveController(ILiveService liveService)
        {
            _liveService = liveService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCurrent()
        {
            var current = await _liveService.GetCurrentAsync();
            if (current == null)
            {
                return Ok(null);
            }

            return Ok(new LiveUpdateDto
            {
                Id = current.Id,
                Message = current.Message,
                CreatedOn = current.CreatedOn
            });
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            var history = await _liveService.GetHistoryAsync();
            return Ok(history.Select(item => new LiveUpdateDto
            {
                Id = item.Id,
                Message = item.Message,
                CreatedOn = item.CreatedOn
            }));
        }

        [HttpPost("broadcast")]
        public async Task<IActionResult> Broadcast([FromBody] LiveBroadcastDto dto)
        {
            var saved = await _liveService.SendLiveMessageAsync(dto.Message);
            return Ok(new LiveUpdateDto
            {
                Id = saved.Id,
                Message = saved.Message,
                CreatedOn = saved.CreatedOn
            });
        }
    }
}
