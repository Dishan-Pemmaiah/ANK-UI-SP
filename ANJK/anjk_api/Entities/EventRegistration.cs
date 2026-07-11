using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class EventRegistration
    {
        [Key]
        public int Id { get; set; }

        public int EventId { get; set; }
        public Event Event { get; set; } = null!;

        public int AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public DateTime RegisteredOn { get; set; } = DateTime.UtcNow;
        public string PaymentStatus { get; set; } = "Pending";
        public decimal AmountPaid { get; set; }
    }
}