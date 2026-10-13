namespace Saay.Services.Interfaces
{
    public interface IPasswordResetTokenService
    {
        public Task<bool> CreatePasswordResetTokenAsync(int userId, string token, DateTime expiration);
        public Task<string> GetTokenAsync(string email);
        public Task<bool> MarkAsUsedAsync(int userId, string token);
    }
}
