using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class HallOfFameItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(140)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;
    }
}
