using anjk_api.Entities;
using anjk_api.Models.Dtos;
using anjk_api.Repositories;

namespace anjk_api.Services
{
    public class GalleryService : IGalleryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public GalleryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<GalleryItemDto>> GetAllAsync()
        {
            var items = await _unitOfWork.Repository<GalleryItem>().GetAllAsync();
            return items.Select(g => new GalleryItemDto
            {
                Id = g.Id,
                Title = g.Title,
                ImageUrl = g.ImageUrl
            });
        }

        public async Task<GalleryItemDto> CreateAsync(GalleryCreateDto dto)
        {
            var entity = new GalleryItem
            {
                Title = dto.Title,
                ImageUrl = dto.ImageUrl,
                UploadedOn = DateTime.UtcNow
            };
            await _unitOfWork.Repository<GalleryItem>().AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            return new GalleryItemDto
            {
                Id = entity.Id,
                Title = entity.Title,
                ImageUrl = entity.ImageUrl
            };
        }
    }
}