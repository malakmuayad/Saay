using Microsoft.EntityFrameworkCore;
using Saay.Data;
using Saay.Data.Entities;
using Saay.Repository.Interfaces;

namespace Saay.Repository.Classes
{
    public class EmailConfirmationRepository : IEmailConfirmationRepository
    {
        private readonly SaayContext _context;

        public EmailConfirmationRepository(SaayContext context)
        {
            _context = context;
        }
        public async Task<int?> AddConfirmationTokenAsync(EmailConfirmationToken token)
        {
            _context.EmailConfirmationTokens.Add(token);

            if (await _context.SaveChangesAsync() > 0)
                return token.EmailConfirmationTokenId;

            return null;
        }

        public async Task<EmailConfirmationToken?> GetConfirmationTokenByHashAsync(string tokenHash) =>
            await _context.EmailConfirmationTokens
                .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

        public async Task<bool?> UpdateConfirmationTokenAsync(int tokenId, EmailConfirmationToken newToken)
        {
           EmailConfirmationToken token = await _context.EmailConfirmationTokens.FindAsync(tokenId);
            
            if (token == null)
                return null;

            token.TokenHash = newToken.TokenHash;
            token.ExpiresAt = newToken.ExpiresAt;
            token.UsedAt = newToken.UsedAt;
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
