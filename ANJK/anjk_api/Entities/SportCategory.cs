using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class SportCategory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
        public ICollection<Team> Teams { get; set; } = new List<Team>();
    }
}