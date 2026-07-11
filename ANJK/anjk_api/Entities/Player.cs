using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class Player
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(60)]
        public string Position { get; set; } = string.Empty;

        public int TeamId { get; set; }
        public Team Team { get; set; } = null!;
    }
}