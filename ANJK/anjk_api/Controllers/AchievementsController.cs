using anjk_api.Repositories;
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
            return Ok(achievements.Select(a => new { a.Id, a.Title, a.Description, a.AwardedOn }));
        }
    }
}
