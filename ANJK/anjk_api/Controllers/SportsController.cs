using anjk_api.Entities;
using anjk_api.Models.Dtos;
using anjk_api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace anjk_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SportsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public SportsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _unitOfWork.Repository<SportCategory>().GetAllAsync();
            return Ok(categories.Select(c => new SportCategoryDto { Id = c.Id, Name = c.Name, Description = c.Description }));
        }

        [HttpGet("teams")]
        public async Task<IActionResult> GetTeams()
        {
            var teams = await _unitOfWork.Repository<Team>().GetAllAsync();
            return Ok(teams.Select(t => new TeamDto { Id = t.Id, Name = t.Name, SportCategoryId = t.SportCategoryId }));
        }

        [HttpGet("players")]
        public async Task<IActionResult> GetPlayers()
        {
            var players = await _unitOfWork.Repository<Player>().GetAllAsync();
            return Ok(players.Select(p => new PlayerDto { Id = p.Id, Name = p.Name, Position = p.Position, TeamId = p.TeamId }));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] SportCategoryDto dto)
        {
            var item = new SportCategory { Name = dto.Name, Description = dto.Description };
            await _unitOfWork.Repository<SportCategory>().AddAsync(item);
            await _unitOfWork.CompleteAsync();
            return CreatedAtAction(nameof(GetCategories), new { id = item.Id }, item);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("teams")]
        public async Task<IActionResult> CreateTeam([FromBody] TeamDto dto)
        {
            var item = new Team { Name = dto.Name, SportCategoryId = dto.SportCategoryId };
            await _unitOfWork.Repository<Team>().AddAsync(item);
            await _unitOfWork.CompleteAsync();
            return CreatedAtAction(nameof(GetTeams), new { id = item.Id }, item);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("players")]
        public async Task<IActionResult> CreatePlayer([FromBody] PlayerDto dto)
        {
            var item = new Player { Name = dto.Name, Position = dto.Position, TeamId = dto.TeamId };
            await _unitOfWork.Repository<Player>().AddAsync(item);
            await _unitOfWork.CompleteAsync();
            return CreatedAtAction(nameof(GetPlayers), new { id = item.Id }, item);
        }
    }
}