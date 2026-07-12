using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using anjk_api.Repositories;
using anjk_api.Entities;
using Microsoft.AspNetCore.Identity;

namespace anjk_api.Services
{
    public class BasicAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher<AppUser> _passwordHasher;

        public BasicAuthenticationHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock,
            IUnitOfWork unitOfWork)
            : base(options, logger, encoder, clock)
        {
            _unitOfWork = unitOfWork;
            _passwordHasher = new PasswordHasher<AppUser>();
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.ContainsKey("Authorization"))
            {
                return AuthenticateResult.NoResult();
            }

            var authHeader = AuthenticationHeaderValue.Parse(Request.Headers["Authorization"]);
            if (!authHeader.Scheme.Equals("Basic", StringComparison.OrdinalIgnoreCase))
            {
                return AuthenticateResult.Fail("Invalid authentication scheme");
            }

            string credentials;
            try
            {
                credentials = Encoding.UTF8.GetString(Convert.FromBase64String(authHeader.Parameter ?? string.Empty));
            }
            catch
            {
                return AuthenticateResult.Fail("Invalid Authorization header");
            }

            var parts = credentials.Split(':');
            if (parts.Length != 2)
            {
                return AuthenticateResult.Fail("Invalid Authorization header format");
            }

            var email = parts[0];
            var password = parts[1];
            var users = await _unitOfWork.Repository<AppUser>().FindAsync(u => u.Email == email);
            var user = users.FirstOrDefault();
            if (user == null)
            {
                return AuthenticateResult.Fail("Invalid username or password");
            }

            var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);
            if (verification == PasswordVerificationResult.Failed)
            {
                return AuthenticateResult.Fail("Invalid username or password");
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
    }
}
