namespace Saay.Data.Entities
{
    public class EmailConfirmationToken
    {
        public int EmailConfirmationTokenId { get; set; }

        public int UserId { get; set; }

        public string TokenHash { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public DateTime? UsedAt { get; set; }

        public User User { get; set; } = null!;
    }
}
