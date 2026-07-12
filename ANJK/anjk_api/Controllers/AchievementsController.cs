using anjk_api.Models.Dtos;
using anjk_api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace anjk_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AchievementsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public AchievementsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var achievements = await _unitOfWork.Repository<Entities.Achievement>().GetAllAsync();
            return Ok(achievements.Select(a => new AchievementDto { Id = a.Id, Title = a.Title, Description = a.Description, AwardedOn = a.AwardedOn }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var achievement = await _unitOfWork.Repository<Entities.Achievement>().GetByIdAsync(id);
            return achievement == null ? NotFound() : Ok(new AchievementDto
            {
                Id = achievement.Id,
                Title = achievement.Title,
                Description = achievement.Description,
                AwardedOn = achievement.AwardedOn
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AchievementCreateDto dto)
        {
            var achievement = new Entities.Achievement
            {
                Title = dto.Title,
                Description = dto.Description,
                AwardedOn = dto.AwardedOn
            };

            await _unitOfWork.Repository<Entities.Achievement>().AddAsync(achievement);
            await _unitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(GetById), new { id = achievement.Id }, new AchievementDto
            {
                Id = achievement.Id,
                Title = achievement.Title,
                Description = achievement.Description,
                AwardedOn = achievement.AwardedOn
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AchievementCreateDto dto)
        {
            var achievement = await _unitOfWork.Repository<Entities.Achievement>().GetByIdAsync(id);
            if (achievement == null)
            {
                return NotFound();
            }

            achievement.Title = dto.Title;
            achievement.Description = dto.Description;
            achievement.AwardedOn = dto.AwardedOn;
            _unitOfWork.Repository<Entities.Achievement>().Update(achievement);
            await _unitOfWork.CompleteAsync();

            return Ok(new AchievementDto
            {
                Id = achievement.Id,
                Title = achievement.Title,
                Description = achievement.Description,
                AwardedOn = achievement.AwardedOn
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var achievement = await _unitOfWork.Repository<Entities.Achievement>().GetByIdAsync(id);
            if (achievement == null)
            {
                return NotFound();
            }

            _unitOfWork.Repository<Entities.Achievement>().Delete(achievement);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }
    }
}
