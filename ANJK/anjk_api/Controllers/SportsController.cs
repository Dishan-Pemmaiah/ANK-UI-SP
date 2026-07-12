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

        [HttpGet("categories/{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var category = await _unitOfWork.Repository<SportCategory>().GetByIdAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            return Ok(new SportCategoryDto { Id = category.Id, Name = category.Name, Description = category.Description });
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

        [HttpGet("tournaments")]
        public async Task<IActionResult> GetTournaments()
        {
            var records = await _unitOfWork.Repository<SportTournamentRecord>().GetAllAsync();
            return Ok(records
                .OrderBy(r => r.ActivityType)
                .ThenBy(r => r.RecordState)
                .ThenBy(r => r.SortOrder)
                .Select(r => new SportTournamentDto
                {
                    Id = r.Id,
                    Title = r.Title,
                    SportName = r.SportName,
                    ActivityType = r.ActivityType,
                    RecordState = r.RecordState,
                    EventDate = r.EventDate,
                    Venue = r.Venue,
                    OpponentOrHost = r.OpponentOrHost,
                    Description = r.Description,
                    Result = r.Result,
                    SortOrder = r.SortOrder
                }));
        }

        [HttpGet("tournaments/{id}")]
        public async Task<IActionResult> GetTournamentById(int id)
        {
            var record = await _unitOfWork.Repository<SportTournamentRecord>().GetByIdAsync(id);
            if (record == null)
            {
                return NotFound();
            }

            return Ok(new SportTournamentDto
            {
                Id = record.Id,
                Title = record.Title,
                SportName = record.SportName,
                ActivityType = record.ActivityType,
                RecordState = record.RecordState,
                EventDate = record.EventDate,
                Venue = record.Venue,
                OpponentOrHost = record.OpponentOrHost,
                Description = record.Description,
                Result = record.Result,
                SortOrder = record.SortOrder
            });
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
        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] SportCategoryDto dto)
        {
            var item = await _unitOfWork.Repository<SportCategory>().GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Name = dto.Name;
            item.Description = dto.Description;
            _unitOfWork.Repository<SportCategory>().Update(item);
            await _unitOfWork.CompleteAsync();

            return Ok(new SportCategoryDto { Id = item.Id, Name = item.Name, Description = item.Description });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var item = await _unitOfWork.Repository<SportCategory>().GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            _unitOfWork.Repository<SportCategory>().Delete(item);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("tournaments")]
        public async Task<IActionResult> CreateTournament([FromBody] SportTournamentCreateDto dto)
        {
            var record = new SportTournamentRecord
            {
                Title = dto.Title,
                SportName = dto.SportName,
                ActivityType = dto.ActivityType,
                RecordState = dto.RecordState,
                EventDate = dto.EventDate,
                Venue = dto.Venue,
                OpponentOrHost = dto.OpponentOrHost,
                Description = dto.Description,
                Result = dto.Result,
                SortOrder = dto.SortOrder
            };

            await _unitOfWork.Repository<SportTournamentRecord>().AddAsync(record);
            await _unitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(GetTournamentById), new { id = record.Id }, new SportTournamentDto
            {
                Id = record.Id,
                Title = record.Title,
                SportName = record.SportName,
                ActivityType = record.ActivityType,
                RecordState = record.RecordState,
                EventDate = record.EventDate,
                Venue = record.Venue,
                OpponentOrHost = record.OpponentOrHost,
                Description = record.Description,
                Result = record.Result,
                SortOrder = record.SortOrder
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("tournaments/{id}")]
        public async Task<IActionResult> UpdateTournament(int id, [FromBody] SportTournamentCreateDto dto)
        {
            var record = await _unitOfWork.Repository<SportTournamentRecord>().GetByIdAsync(id);
            if (record == null)
            {
                return NotFound();
            }

            record.Title = dto.Title;
            record.SportName = dto.SportName;
            record.ActivityType = dto.ActivityType;
            record.RecordState = dto.RecordState;
            record.EventDate = dto.EventDate;
            record.Venue = dto.Venue;
            record.OpponentOrHost = dto.OpponentOrHost;
            record.Description = dto.Description;
            record.Result = dto.Result;
            record.SortOrder = dto.SortOrder;

            _unitOfWork.Repository<SportTournamentRecord>().Update(record);
            await _unitOfWork.CompleteAsync();

            return Ok(new SportTournamentDto
            {
                Id = record.Id,
                Title = record.Title,
                SportName = record.SportName,
                ActivityType = record.ActivityType,
                RecordState = record.RecordState,
                EventDate = record.EventDate,
                Venue = record.Venue,
                OpponentOrHost = record.OpponentOrHost,
                Description = record.Description,
                Result = record.Result,
                SortOrder = record.SortOrder
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("tournaments/{id}")]
        public async Task<IActionResult> DeleteTournament(int id)
        {
            var record = await _unitOfWork.Repository<SportTournamentRecord>().GetByIdAsync(id);
            if (record == null)
            {
                return NotFound();
            }

            _unitOfWork.Repository<SportTournamentRecord>().Delete(record);
            await _unitOfWork.CompleteAsync();
            return NoContent();
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