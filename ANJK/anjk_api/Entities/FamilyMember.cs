using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace anjk_api.Entities
{
    public class FamilyMember
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Relation { get; set; } = string.Empty;

        public int Age { get; set; }

        public int AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;
    }
}