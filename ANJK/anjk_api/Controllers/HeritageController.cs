using anjk_api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace anjk_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HeritageController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public HeritageController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _unitOfWork.Repository<Entities.HeritageItem>().GetAllAsync();
            return Ok(items.Select(i => new { i.Id, i.Title, i.Description }));
        }
    }
}
