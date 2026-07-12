namespace anjk_api.Models.Dtos
{
    public class LiveBroadcastDto
    {
        public string Message { get; set; } = string.Empty;
    }

    public class LiveUpdateDto
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
    }
}
