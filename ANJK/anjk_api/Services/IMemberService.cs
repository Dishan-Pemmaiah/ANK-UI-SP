using anjk_api.Models.Dtos;

namespace anjk_api.Services
{
    public interface IMemberService
    {
        Task<MemberProfileDto?> GetProfileAsync(int userId);
        Task<MemberProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto dto);
        Task<IEnumerable<MemberListDto>> GetAllAsync();
        Task<MemberProfileDto?> GetByIdAsync(int id);
        Task<MemberProfileDto> CreateAsync(AdminMemberCreateDto dto);
        Task<MemberProfileDto> UpdateAsync(int id, AdminMemberUpdateDto dto);
        Task<MemberProfileDto> ApproveAdminAsync(int id);
        Task DeleteAsync(int id);
    }
}