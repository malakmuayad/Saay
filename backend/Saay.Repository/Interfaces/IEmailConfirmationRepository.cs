using Saay.Data.Entities;

namespace Saay.Repository.Interfaces
{
    public interface IEmailConfirmationRepository
    {
        public Task<int?> AddConfirmationTokenAsync(EmailConfirmationToken token);

        public Task<EmailConfirmationToken?> GetConfirmationTokenByHashAsync(
            string tokenHash);

        public Task<bool?> UpdateConfirmationTokenAsync(int tokenId, EmailConfirmationToken token);
    }
}
