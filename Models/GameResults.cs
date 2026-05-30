namespace FlagQuizGame.Models
{
    public class GameResults
    {
        public int Id { get; set; }
        public string PlayerName { get; set; } = "";
        public string Continent { get; set; } = "";
        public string Level { get; set; } = "";
        public int Score { get; set; }
        public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
    }
}
