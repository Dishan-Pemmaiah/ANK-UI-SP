namespace anjk_api.Models.Dtos
{
    public class SportTournamentDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string SportName { get; set; } = string.Empty;
        public string ActivityType { get; set; } = string.Empty;
        public string RecordState { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public string Venue { get; set; } = string.Empty;
        public string OpponentOrHost { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;
        public int SortOrder { get; set; }
    }

    public class SportTournamentCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string SportName { get; set; } = string.Empty;
        public string ActivityType { get; set; } = "Played";
        public string RecordState { get; set; } = "History";
        public DateTime EventDate { get; set; } = DateTime.UtcNow;
        public string Venue { get; set; } = string.Empty;
        public string OpponentOrHost { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;
        public int SortOrder { get; set; }
    }
}