using anjk_api.Models.Dtos;
using anjk_api.Repositories;
using Microsoft.AspNetCore.Identity;

namespace anjk_api.Services
{
    public class MemberService : IMemberService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher<anjk_api.Entities.AppUser> _passwordHasher;

        public MemberService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _passwordHasher = new PasswordHasher<anjk_api.Entities.AppUser>();
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

        public async Task<MemberProfileDto?> GetByIdAsync(int id)
        {
            return await GetProfileAsync(id);
        }

        public async Task<MemberProfileDto> CreateAsync(AdminMemberCreateDto dto)
        {
            var existingUsers = await _unitOfWork.Repository<anjk_api.Entities.AppUser>().FindAsync(u => u.Email == dto.Email);
            if (existingUsers.Any())
            {
                throw new InvalidOperationException("Email is already registered.");
            }

            var user = new anjk_api.Entities.AppUser
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Role = string.IsNullOrWhiteSpace(dto.Role) ? "General Public" : dto.Role,
                MembershipStatus = string.IsNullOrWhiteSpace(dto.MembershipStatus) ? "Active" : dto.MembershipStatus,
                MembershipExpires = dto.MembershipExpires
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

            await _unitOfWork.Repository<anjk_api.Entities.AppUser>().AddAsync(user);
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

        public async Task<MemberProfileDto> UpdateAsync(int id, AdminMemberUpdateDto dto)
        {
            var user = await _unitOfWork.Repository<anjk_api.Entities.AppUser>().GetByIdAsync(id);
            if (user == null)
            {
                throw new InvalidOperationException("User not found.");
            }

            var existingUsers = await _unitOfWork.Repository<anjk_api.Entities.AppUser>().FindAsync(u => u.Email == dto.Email && u.Id != id);
            if (existingUsers.Any())
            {
                throw new InvalidOperationException("Email is already registered.");
            }

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Role = string.IsNullOrWhiteSpace(dto.Role) ? user.Role : dto.Role;
            user.MembershipStatus = string.IsNullOrWhiteSpace(dto.MembershipStatus) ? user.MembershipStatus : dto.MembershipStatus;
            user.MembershipExpires = dto.MembershipExpires;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);
            }

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

        public async Task<MemberProfileDto> ApproveAdminAsync(int id)
        {
            var user = await _unitOfWork.Repository<anjk_api.Entities.AppUser>().GetByIdAsync(id);
            if (user == null)
            {
                throw new InvalidOperationException("User not found.");
            }

            user.Role = "Admin";
            user.MembershipStatus = "Active";
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

        public async Task DeleteAsync(int id)
        {
            var user = await _unitOfWork.Repository<anjk_api.Entities.AppUser>().GetByIdAsync(id);
            if (user == null)
            {
                throw new InvalidOperationException("User not found.");
            }

            _unitOfWork.Repository<anjk_api.Entities.AppUser>().Delete(user);
            await _unitOfWork.CompleteAsync();
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