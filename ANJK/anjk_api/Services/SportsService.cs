using anjk_api.Entities;
using anjk_api.Models.Dtos;
using anjk_api.Repositories;

namespace anjk_api.Services
{
    public class SportsService : ISportsService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SportsService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<SportCategoryDto> CreateCategoryAsync(SportCategoryDto dto)
        {
            var entity = new SportCategory { Name = dto.Name, Description = dto.Description };
            await _unitOfWork.Repository<SportCategory>().AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            dto.Id = entity.Id;
            return dto;
        }

        public async Task<PlayerDto> CreatePlayerAsync(PlayerDto dto)
        {
            var entity = new Player { Name = dto.Name, Position = dto.Position, TeamId = dto.TeamId };
            await _unitOfWork.Repository<Player>().AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            dto.Id = entity.Id;
            return dto;
        }

        public async Task<TeamDto> CreateTeamAsync(TeamDto dto)
        {
            var entity = new Team { Name = dto.Name, SportCategoryId = dto.SportCategoryId };
            await _unitOfWork.Repository<Team>().AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            dto.Id = entity.Id;
            return dto;
        }

        public async Task<IEnumerable<PlayerDto>> GetPlayersAsync()
        {
            var items = await _unitOfWork.Repository<Player>().GetAllAsync();
            return items.Select(p => new PlayerDto { Id = p.Id, Name = p.Name, Position = p.Position, TeamId = p.TeamId });
        }

        public async Task<IEnumerable<SportCategoryDto>> GetCategoriesAsync()
        {
            var items = await _unitOfWork.Repository<SportCategory>().GetAllAsync();
            return items.Select(c => new SportCategoryDto { Id = c.Id, Name = c.Name, Description = c.Description });
        }

        public async Task<IEnumerable<TeamDto>> GetTeamsAsync()
        {
            var items = await _unitOfWork.Repository<Team>().GetAllAsync();
            return items.Select(t => new TeamDto { Id = t.Id, Name = t.Name, SportCategoryId = t.SportCategoryId });
        }
    }
}
