using Saay.Repository.Interfaces;
using Saay.Services.Interfaces;

namespace Saay.Services.Classes
{
    public class PasswordResetTokenService : IPasswordResetTokenService
    {
        private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
        private readonly IHashService _hashService;

        public PasswordResetTokenService(IPasswordResetTokenRepository passwordResetTokenRepository, IHashService hashService)
        {
            _passwordResetTokenRepository = passwordResetTokenRepository;
            _hashService = hashService;
        }
        public async Task<bool> CreatePasswordResetTokenAsync(int userId, string token, DateTime expiration)
        {
            string hashedCode = _hashService.HashToken(token);
           return await _passwordResetTokenRepository.CreatePasswordResetTokenAsync(userId, hashedCode, expiration);
        }
        public async Task<string> GetTokenAsync(string email) =>
            await _passwordResetTokenRepository.GetTokenAsync(email);
        public async Task<bool> MarkAsUsedAsync(int userId, string token) =>
            await _passwordResetTokenRepository.MarkAsUsedAsync(userId, token);
    }
}
