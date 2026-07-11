using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class Village
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
    }
}
