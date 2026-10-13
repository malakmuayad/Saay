using Microsoft.EntityFrameworkCore;
using Saay.Data;
using Saay.Data.Entities;
using Saay.Repository.Interfaces;

namespace Saay.Repository.Classes
{
    public class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly SaayContext _context;

        public PasswordResetTokenRepository(SaayContext context)
        {
            _context = context;
        }
        public async Task<bool> CreatePasswordResetTokenAsync(int userId, string token, DateTime expiration)
        {
            PasswordResetToken passwordResetToken = new PasswordResetToken
            {
                UserId = userId,
                CodeHash = token,
                ExpiresAt = expiration,
                UsedAt = null
            };

            await _context.PasswordResetTokens.AddAsync(passwordResetToken);
            return await _context.SaveChangesAsync() > 0 ? true : false;
        }

        public async Task<bool> MarkAsUsedAsync(int userId, string token)
        {
            PasswordResetToken passwordResetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(p => p.UserId == userId && p.CodeHash == token);

            if (passwordResetToken == null ||
                passwordResetToken.UsedAt != null ||
                passwordResetToken.ExpiresAt <= DateTime.UtcNow)
            { 
                return false;
            }

            passwordResetToken.UsedAt = DateTime.UtcNow;
            return await _context.SaveChangesAsync() > 0 ? true : false;
        }

        public async Task<string> GetTokenAsync(string email) =>
            await _context.PasswordResetTokens
                .Where(p => p.User.Email == email && p.UsedAt == null
                && p.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(p => p.ExpiresAt)
                .Select(p => p.CodeHash)
                .FirstOrDefaultAsync();
    }
}
