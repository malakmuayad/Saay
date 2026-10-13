namespace Saay.Repository.Interfaces
{
    public interface IPasswordResetTokenRepository
    {
        public Task<bool> CreatePasswordResetTokenAsync(int userId, string token, DateTime expiration);
        public Task<string> GetTokenAsync(string email);
        public Task<bool>MarkAsUsedAsync(int userId, string token);
    }
}
