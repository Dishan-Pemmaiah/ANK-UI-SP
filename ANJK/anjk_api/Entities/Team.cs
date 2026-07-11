using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class Team
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        public int SportCategoryId { get; set; }
        public SportCategory SportCategory { get; set; } = null!;

        public ICollection<Player> Players { get; set; } = new List<Player>();
    }
}