using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace anjk_api.Entities
{
    public class AppUser
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(32)]
        public string Role { get; set; } = "Member";

        [Required]
        [MaxLength(32)]
        public string MembershipStatus { get; set; } = "Active";

        public DateTime MembershipExpires { get; set; } = DateTime.UtcNow.AddYears(1);

        public ICollection<FamilyMember> FamilyMembers { get; set; } = new List<FamilyMember>();

        public ICollection<EventRegistration> EventRegistrations { get; set; } = new List<EventRegistration>();
    }
}