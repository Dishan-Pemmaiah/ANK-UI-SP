using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class Fixture
    {
        [Key]
        public int Id { get; set; }

        public int EventId { get; set; }
        public Event Event { get; set; } = null!;

        public DateTime MatchDate { get; set; }
        public string Location { get; set; } = string.Empty;
        public string TeamA { get; set; } = string.Empty;
        public string TeamB { get; set; } = string.Empty;
        public string Score { get; set; } = string.Empty;
        public bool Completed { get; set; }
    }
}