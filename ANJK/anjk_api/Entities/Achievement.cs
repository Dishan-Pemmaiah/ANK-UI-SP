using System;
using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class Achievement
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public DateTime AwardedOn { get; set; }
    }
}
