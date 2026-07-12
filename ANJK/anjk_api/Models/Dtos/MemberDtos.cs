namespace anjk_api.Models.Dtos
{
    public class MemberProfileDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string MembershipStatus { get; set; } = string.Empty;
        public DateTime MembershipExpires { get; set; }
    }

    public class UpdateProfileDto
    {
        public string FullName { get; set; } = string.Empty;
    }

    public class MemberListDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string MembershipStatus { get; set; } = string.Empty;
        public DateTime MembershipExpires { get; set; }
    }

    public class AdminMemberCreateDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "General Public";
        public string MembershipStatus { get; set; } = "Active";
        public DateTime MembershipExpires { get; set; } = DateTime.UtcNow.AddYears(1);
    }

    public class AdminMemberUpdateDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "General Public";
        public string MembershipStatus { get; set; } = "Active";
        public DateTime MembershipExpires { get; set; } = DateTime.UtcNow.AddYears(1);
        public string? Password { get; set; }
    }
}
