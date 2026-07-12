using anjk_api.Models.Dtos;
using anjk_api.Repositories;
using Microsoft.AspNetCore.Authorization;
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
            return Ok(items.Select(i => new HeritageItemDto { Id = i.Id, Title = i.Title, Description = i.Description }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _unitOfWork.Repository<Entities.HeritageItem>().GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            return Ok(new HeritageItemDto { Id = item.Id, Title = item.Title, Description = item.Description });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] HeritageItemCreateDto dto)
        {
            var item = new Entities.HeritageItem
            {
                Title = dto.Title,
                Description = dto.Description
            };

            await _unitOfWork.Repository<Entities.HeritageItem>().AddAsync(item);
            await _unitOfWork.CompleteAsync();
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, new HeritageItemDto { Id = item.Id, Title = item.Title, Description = item.Description });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] HeritageItemCreateDto dto)
        {
            var item = await _unitOfWork.Repository<Entities.HeritageItem>().GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Title = dto.Title;
            item.Description = dto.Description;
            _unitOfWork.Repository<Entities.HeritageItem>().Update(item);
            await _unitOfWork.CompleteAsync();

            return Ok(new HeritageItemDto { Id = item.Id, Title = item.Title, Description = item.Description });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _unitOfWork.Repository<Entities.HeritageItem>().GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            _unitOfWork.Repository<Entities.HeritageItem>().Delete(item);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }
    }
}
