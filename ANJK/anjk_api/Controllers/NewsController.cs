using anjk_api.Models.Dtos;
using anjk_api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace anjk_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public NewsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _unitOfWork.Repository<Entities.NewsItem>().GetAllAsync();
            return Ok(items.Select(n => new NewsItemDto
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                PublishedOn = n.PublishedOn
            }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _unitOfWork.Repository<Entities.NewsItem>().GetByIdAsync(id);
            return item == null ? NotFound() : Ok(new NewsItemDto
            {
                Id = item.Id,
                Title = item.Title,
                Content = item.Content,
                PublishedOn = item.PublishedOn
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NewsCreateDto dto)
        {
            var entity = new Entities.NewsItem
            {
                Title = dto.Title,
                Content = dto.Content,
                PublishedOn = DateTime.UtcNow,
                IsFeatured = false
            };
            await _unitOfWork.Repository<Entities.NewsItem>().AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, entity);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] NewsCreateDto dto)
        {
            var item = await _unitOfWork.Repository<Entities.NewsItem>().GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Title = dto.Title;
            item.Content = dto.Content;
            _unitOfWork.Repository<Entities.NewsItem>().Update(item);
            await _unitOfWork.CompleteAsync();

            return Ok(new NewsItemDto
            {
                Id = item.Id,
                Title = item.Title,
                Content = item.Content,
                PublishedOn = item.PublishedOn
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _unitOfWork.Repository<Entities.NewsItem>().GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            _unitOfWork.Repository<Entities.NewsItem>().Delete(item);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }
    }
}