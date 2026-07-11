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
    }
}