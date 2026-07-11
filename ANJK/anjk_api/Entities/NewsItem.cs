using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class NewsItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime PublishedOn { get; set; } = DateTime.UtcNow;
        public bool IsFeatured { get; set; }
    }
}