using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class CommitteeMember
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(80)]
        public string Role { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
    }
}
