using anjk_api.Models.Dtos;

namespace anjk_api.Services
{
    public interface INewsService
    {
        Task<IEnumerable<NewsItemDto>> GetAllAsync();
        Task<NewsItemDto> CreateAsync(NewsCreateDto dto);
    }
}