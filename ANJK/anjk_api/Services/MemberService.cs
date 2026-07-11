using anjk_api.Models.Dtos;
using anjk_api.Repositories;

namespace anjk_api.Services
{
    public class MemberService : IMemberService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MemberService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<MemberProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _unitOfWork.Repository<anjk_api.Entities.AppUser>().GetByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            return new MemberProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                MembershipStatus = user.MembershipStatus,
                MembershipExpires = user.MembershipExpires
            };
        }

        public async Task<IEnumerable<MemberListDto>> GetAllAsync()
        {
            var users = await _unitOfWork.Repository<anjk_api.Entities.AppUser>().GetAllAsync();
            return users.Select(user => new MemberListDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                MembershipStatus = user.MembershipStatus,
                MembershipExpires = user.MembershipExpires
            });
        }

        public async Task<MemberProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await _unitOfWork.Repository<anjk_api.Entities.AppUser>().GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found.");
            }

            user.FullName = dto.FullName;
            _unitOfWork.Repository<anjk_api.Entities.AppUser>().Update(user);
            await _unitOfWork.CompleteAsync();

            return new MemberProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                MembershipStatus = user.MembershipStatus,
                MembershipExpires = user.MembershipExpires
            };
        }
    }
}