using anjk_api.Entities;
using anjk_api.Models.Dtos;
using anjk_api.Repositories;
using Microsoft.AspNetCore.Identity;
using System.Text;

namespace anjk_api.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher<AppUser> _passwordHasher;

        public AuthService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _passwordHasher = new PasswordHasher<AppUser>();
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var users = await _unitOfWork.Repository<AppUser>().FindAsync(u => u.Email == request.Email);
            var user = users.FirstOrDefault();
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
                Token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{request.Email}:{request.Password}")),
                Role = user.Role,
                FullName = user.FullName
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            var existingUsers = await _unitOfWork.Repository<AppUser>().FindAsync(u => u.Email == request.Email);
            if (existingUsers.Any())
            {
                throw new InvalidOperationException("Email is already registered.");
            }

            var user = new AppUser
            {
                FullName = request.FullName,
                Email = request.Email,
                Role = request.Role,
                MembershipExpires = DateTime.UtcNow.AddYears(1),
                MembershipStatus = "Active"
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            await _unitOfWork.Repository<AppUser>().AddAsync(user);
            await _unitOfWork.CompleteAsync();

            return new AuthResponseDto
            {
                Token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{request.Email}:{request.Password}")),
                Role = user.Role,
                FullName = user.FullName
            };
        }
    }
}