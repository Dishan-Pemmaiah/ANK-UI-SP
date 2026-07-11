using System.ComponentModel.DataAnnotations;

namespace anjk_api.Entities
{
    public class PointTableEntry
    {
        [Key]
        public int Id { get; set; }

        public int TeamId { get; set; }
        public Team Team { get; set; } = null!;

        public int Played { get; set; }
        public int Won { get; set; }
        public int Drawn { get; set; }
        public int Lost { get; set; }
        public int Points { get; set; }
    }
}