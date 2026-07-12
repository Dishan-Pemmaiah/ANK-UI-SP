using anjk_api.Entities;
using anjk_api.Models.Dtos;
using anjk_api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace anjk_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AboutController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public AboutController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sections = await _unitOfWork.Repository<AboutSection>().GetAllAsync();
            return Ok(sections
                .Where(section => section.IsActive)
                .OrderBy(section => section.SortOrder)
                .Select(section => new AboutSectionDto
                {
                    Id = section.Id,
                    Title = section.Title,
                    Body = section.Body,
                    SortOrder = section.SortOrder,
                    IsActive = section.IsActive
                }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var section = await _unitOfWork.Repository<AboutSection>().GetByIdAsync(id);
            if (section == null)
            {
                return NotFound();
            }

            return Ok(new AboutSectionDto
            {
                Id = section.Id,
                Title = section.Title,
                Body = section.Body,
                SortOrder = section.SortOrder,
                IsActive = section.IsActive
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AboutSectionCreateDto dto)
        {
            var section = new AboutSection
            {
                Title = dto.Title,
                Body = dto.Body,
                SortOrder = dto.SortOrder,
                IsActive = dto.IsActive
            };

            await _unitOfWork.Repository<AboutSection>().AddAsync(section);
            await _unitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(GetById), new { id = section.Id }, new AboutSectionDto
            {
                Id = section.Id,
                Title = section.Title,
                Body = section.Body,
                SortOrder = section.SortOrder,
                IsActive = section.IsActive
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AboutSectionCreateDto dto)
        {
            var section = await _unitOfWork.Repository<AboutSection>().GetByIdAsync(id);
            if (section == null)
            {
                return NotFound();
            }

            section.Title = dto.Title;
            section.Body = dto.Body;
            section.SortOrder = dto.SortOrder;
            section.IsActive = dto.IsActive;
            _unitOfWork.Repository<AboutSection>().Update(section);
            await _unitOfWork.CompleteAsync();

            return Ok(new AboutSectionDto
            {
                Id = section.Id,
                Title = section.Title,
                Body = section.Body,
                SortOrder = section.SortOrder,
                IsActive = section.IsActive
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var section = await _unitOfWork.Repository<AboutSection>().GetByIdAsync(id);
            if (section == null)
            {
                return NotFound();
            }

            _unitOfWork.Repository<AboutSection>().Delete(section);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }
    }
}