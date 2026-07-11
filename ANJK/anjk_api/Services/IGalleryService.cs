using anjk_api.Models.Dtos;

namespace anjk_api.Services
{
    public interface IGalleryService
    {
        Task<IEnumerable<GalleryItemDto>> GetAllAsync();
        Task<GalleryItemDto> CreateAsync(GalleryCreateDto dto);
    }
}