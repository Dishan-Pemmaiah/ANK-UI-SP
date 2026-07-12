using anjk_api.Models.Dtos;
using anjk_api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace anjk_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GalleryController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public GalleryController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _unitOfWork.Repository<Entities.GalleryItem>().GetAllAsync();
            return Ok(items.Select(i => new GalleryItemDto
            {
                Id = i.Id,
                Title = i.Title,
                ImageUrl = i.ImageUrl
            }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _unitOfWork.Repository<Entities.GalleryItem>().GetByIdAsync(id);
            return item == null ? NotFound() : Ok(new GalleryItemDto
            {
                Id = item.Id,
                Title = item.Title,
                ImageUrl = item.ImageUrl
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] GalleryCreateDto dto)
        {
            var entity = new Entities.GalleryItem
            {
                Title = dto.Title,
                ImageUrl = dto.ImageUrl,
                UploadedOn = DateTime.UtcNow
            };
            await _unitOfWork.Repository<Entities.GalleryItem>().AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, entity);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] GalleryCreateDto dto)
        {
            var item = await _unitOfWork.Repository<Entities.GalleryItem>().GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Title = dto.Title;
            item.ImageUrl = dto.ImageUrl;
            _unitOfWork.Repository<Entities.GalleryItem>().Update(item);
            await _unitOfWork.CompleteAsync();

            return Ok(new GalleryItemDto
            {
                Id = item.Id,
                Title = item.Title,
                ImageUrl = item.ImageUrl
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _unitOfWork.Repository<Entities.GalleryItem>().GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            _unitOfWork.Repository<Entities.GalleryItem>().Delete(item);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }
    }
}