using anjk_api.Models.Dtos;

namespace anjk_api.Services
{
    public interface IMemberService
    {
        Task<MemberProfileDto?> GetProfileAsync(int userId);
        Task<MemberProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto dto);
        Task<IEnumerable<MemberListDto>> GetAllAsync();
    }
}