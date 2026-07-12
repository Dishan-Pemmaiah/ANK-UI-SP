namespace anjk_api.Models.Dtos
{
    public class AchievementDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime AwardedOn { get; set; }
    }

    public class AchievementCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime AwardedOn { get; set; } = DateTime.UtcNow;
    }
}