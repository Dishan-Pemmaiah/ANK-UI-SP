using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class SportTournamentRecord
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(40)]
        public string SportName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string ActivityType { get; set; } = "Played";

        [Required]
        [MaxLength(20)]
        public string RecordState { get; set; } = "History";

        public DateTime EventDate { get; set; } = DateTime.UtcNow;

        [MaxLength(180)]
        public string Venue { get; set; } = string.Empty;

        [MaxLength(180)]
        public string OpponentOrHost { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [MaxLength(120)]
        public string Result { get; set; } = string.Empty;

        public int SortOrder { get; set; }
    }
}