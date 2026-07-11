using anjk_api.Models.Dtos;

namespace anjk_api.Services
{
    public interface IEventService
    {
        Task<IEnumerable<EventDto>> GetAllAsync();
        Task<EventDto?> GetByIdAsync(int id);
        Task<EventDto> CreateAsync(EventCreateDto dto);
        Task<EventDto> UpdateAsync(int id, EventCreateDto dto);
        Task RegisterAsync(int eventId, int userId, decimal amountPaid);
    }
}