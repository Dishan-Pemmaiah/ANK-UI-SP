using anjk_api.Models.Dtos;

namespace anjk_api.Services
{
    public interface ISportsService
    {
        Task<IEnumerable<SportCategoryDto>> GetCategoriesAsync();
        Task<IEnumerable<TeamDto>> GetTeamsAsync();
        Task<IEnumerable<PlayerDto>> GetPlayersAsync();
        Task<TeamDto> CreateTeamAsync(TeamDto dto);
        Task<PlayerDto> CreatePlayerAsync(PlayerDto dto);
        Task<SportCategoryDto> CreateCategoryAsync(SportCategoryDto dto);
    }
}