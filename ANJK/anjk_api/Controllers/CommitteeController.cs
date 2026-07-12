using anjk_api.Models.Dtos;
using anjk_api.Repositories;
using Microsoft.AspNetCore.Authorization;
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
            return Ok(items.Select(i => new CommitteeMemberDto { Id = i.Id, Name = i.Name, Role = i.Role, Description = i.Description }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _unitOfWork.Repository<Entities.CommitteeMember>().GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            return Ok(new CommitteeMemberDto { Id = item.Id, Name = item.Name, Role = item.Role, Description = item.Description });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CommitteeMemberCreateDto dto)
        {
            var item = new Entities.CommitteeMember
            {
                Name = dto.Name,
                Role = dto.Role,
                Description = dto.Description
            };

            await _unitOfWork.Repository<Entities.CommitteeMember>().AddAsync(item);
            await _unitOfWork.CompleteAsync();
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, new CommitteeMemberDto { Id = item.Id, Name = item.Name, Role = item.Role, Description = item.Description });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CommitteeMemberCreateDto dto)
        {
            var item = await _unitOfWork.Repository<Entities.CommitteeMember>().GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Name = dto.Name;
            item.Role = dto.Role;
            item.Description = dto.Description;
            _unitOfWork.Repository<Entities.CommitteeMember>().Update(item);
            await _unitOfWork.CompleteAsync();

            return Ok(new CommitteeMemberDto { Id = item.Id, Name = item.Name, Role = item.Role, Description = item.Description });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _unitOfWork.Repository<Entities.CommitteeMember>().GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            _unitOfWork.Repository<Entities.CommitteeMember>().Delete(item);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }
    }
}
