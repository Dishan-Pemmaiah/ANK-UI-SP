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
}
