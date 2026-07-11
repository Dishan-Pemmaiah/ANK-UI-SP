using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class Event
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1200)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(80)]
        public string Category { get; set; } = string.Empty;

        [MaxLength(120)]
        public string Location { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Fee { get; set; }
        public bool IsPublished { get; set; } = true;
        public bool IsPaid { get; set; } = true;

        public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
    }
}