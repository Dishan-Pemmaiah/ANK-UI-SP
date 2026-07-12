using anjk_api.Entities;
using anjk_api.Models.Dtos;
using anjk_api.Repositories;

namespace anjk_api.Services
{
    public class EventService : IEventService
    {
        private readonly IUnitOfWork _unitOfWork;

        public EventService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<EventDto> CreateAsync(EventCreateDto dto)
        {
            var entity = new Event
            {
                Name = dto.Name,
                Description = dto.Description,
                Category = dto.Category,
                Location = dto.Location,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Fee = dto.Fee,
                IsPaid = dto.IsPaid,
                IsPublished = dto.IsPublished
            };

            await _unitOfWork.Repository<Event>().AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            return Map(entity);
        }

        public async Task<IEnumerable<EventDto>> GetAllAsync()
        {
            var entities = await _unitOfWork.Repository<Event>().GetAllAsync();
            return entities.Select(Map);
        }

        public async Task<EventDto?> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.Repository<Event>().GetByIdAsync(id);
            return entity == null ? null : Map(entity);
        }

        public async Task RegisterAsync(int eventId, int userId, decimal amountPaid)
        {
            var registration = new EventRegistration
            {
                EventId = eventId,
                AppUserId = userId,
                AmountPaid = amountPaid,
                PaymentStatus = amountPaid > 0 ? "Completed" : "Pending"
            };

            await _unitOfWork.Repository<EventRegistration>().AddAsync(registration);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<EventDto> UpdateAsync(int id, EventCreateDto dto)
        {
            var entity = await _unitOfWork.Repository<Event>().GetByIdAsync(id);
            if (entity == null)
            {
                throw new InvalidOperationException("Event not found.");
            }

            entity.Name = dto.Name;
            entity.Description = dto.Description;
            entity.Category = dto.Category;
            entity.Location = dto.Location;
            entity.StartDate = dto.StartDate;
            entity.EndDate = dto.EndDate;
            entity.Fee = dto.Fee;
            entity.IsPaid = dto.IsPaid;
            entity.IsPublished = dto.IsPublished;

            _unitOfWork.Repository<Event>().Update(entity);
            await _unitOfWork.CompleteAsync();

            return Map(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Repository<Event>().GetByIdAsync(id);
            if (entity == null)
            {
                throw new InvalidOperationException("Event not found.");
            }

            _unitOfWork.Repository<Event>().Delete(entity);
            await _unitOfWork.CompleteAsync();
        }

        private static EventDto Map(Event entity)
        {
            return new EventDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                Category = entity.Category,
                Location = entity.Location,
                StartDate = entity.StartDate,
                EndDate = entity.EndDate,
                Fee = entity.Fee,
                IsPaid = entity.IsPaid,
                IsPublished = entity.IsPublished
            };
        }
    }
}