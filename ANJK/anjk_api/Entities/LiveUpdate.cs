using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class LiveUpdate
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    }
}