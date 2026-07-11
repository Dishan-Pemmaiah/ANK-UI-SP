using anjk_api.Entities;
using anjk_api.Models.Dtos;
using anjk_api.Repositories;

namespace anjk_api.Services
{
    public class NewsService : INewsService
    {
        private readonly IUnitOfWork _unitOfWork;

        public NewsService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<NewsItemDto>> GetAllAsync()
        {
            var items = await _unitOfWork.Repository<NewsItem>().GetAllAsync();
            return items.Select(n => new NewsItemDto
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                PublishedOn = n.PublishedOn
            });
        }

        public async Task<NewsItemDto> CreateAsync(NewsCreateDto dto)
        {
            var entity = new NewsItem
            {
                Title = dto.Title,
                Content = dto.Content,
                PublishedOn = DateTime.UtcNow,
                IsFeatured = false
            };
            await _unitOfWork.Repository<NewsItem>().AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            return new NewsItemDto
            {
                Id = entity.Id,
                Title = entity.Title,
                Content = entity.Content,
                PublishedOn = entity.PublishedOn
            };
        }
    }
}