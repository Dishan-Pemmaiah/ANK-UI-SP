using anjk_api.Entities;

namespace anjk_api.Services
{
    public interface IJwtTokenService
    {
        string CreateToken(AppUser user);
    }
}