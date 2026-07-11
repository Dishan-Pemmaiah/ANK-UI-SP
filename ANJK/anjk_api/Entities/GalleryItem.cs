using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class GalleryItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(220)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        public DateTime UploadedOn { get; set; } = DateTime.UtcNow;
    }
}