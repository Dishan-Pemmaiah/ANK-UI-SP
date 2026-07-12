using anjk_api.Entities;
using anjk_api.Data;
using anjk_api.Models.Dtos;
using anjk_api.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace anjk_api.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _dbContext;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher<AppUser> _passwordHasher;

        public AuthService(AppDbContext dbContext, IUnitOfWork unitOfWork)
        {
            _dbContext = dbContext;
            _unitOfWork = unitOfWork;
            _passwordHasher = new PasswordHasher<AppUser>();
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var normalizedEmail = request.Email.Trim();
            var user = await _dbContext.AppUsers
                .AsNoTracking()
                .SingleOrDefaultAsync(u => u.Email == normalizedEmail);
            if (user == null)
            {
                throw new InvalidOperationException("Invalid login request.");
            }

            var verify = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verify == PasswordVerificationResult.Failed)
            {
                throw new InvalidOperationException("Invalid login request.");
            }

            return new AuthResponseDto
            {
                Token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{normalizedEmail}:{request.Password}")),
                Role = user.Role,
                FullName = user.FullName
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            var normalizedEmail = request.Email.Trim();
            var emailExists = await _dbContext.AppUsers
                .AsNoTracking()
                .AnyAsync(u => u.Email == normalizedEmail);
            if (emailExists)
            {
                throw new InvalidOperationException("Email is already registered.");
            }

            var user = new AppUser
            {
                FullName = request.FullName,
                Email = normalizedEmail,
                Role = request.RequestAdminApproval || request.Role == "Admin" ? "General Public" : "General Public",
                MembershipExpires = DateTime.UtcNow.AddYears(1),
                MembershipStatus = request.RequestAdminApproval || request.Role == "Admin" ? "Pending Admin Approval" : "Active"
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            await _unitOfWork.Repository<AppUser>().AddAsync(user);
            await _unitOfWork.CompleteAsync();

            return new AuthResponseDto
            {
                Token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{normalizedEmail}:{request.Password}")),
                Role = user.Role,
                FullName = user.FullName
            };
        }
    }
}