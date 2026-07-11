using anjk_api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace anjk_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommitteeController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public CommitteeController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _unitOfWork.Repository<Entities.CommitteeMember>().GetAllAsync();
            return Ok(items.Select(i => new { i.Id, i.Name, i.Role, i.Description }));
        }
    }
}
