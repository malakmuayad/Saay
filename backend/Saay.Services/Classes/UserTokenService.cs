using Saay.Infrastructure.DTOs.TokenDTOs;
using Saay.Repository.Interfaces;
using Saay.Services.Interfaces;

namespace Saay.Services.Classes
{
    public class UserTokenService : IUserTokenService
    {
        private readonly IUserTokenRepository _userTokenRepository;
        private readonly IPasswordHasher _passwordHasher;

        public UserTokenService(IUserTokenRepository usersTokensRepository, IPasswordHasher passwordHasherService)
        {
            _userTokenRepository = usersTokensRepository;
            _passwordHasher = passwordHasherService;
        }
        public async Task<bool?> LoginAsync(int userId, string refreshToken, DateTime refreshTokenExpiresAt) =>
            await _userTokenRepository.LoginAsync(userId, _passwordHasher.HashToken(refreshToken), refreshTokenExpiresAt);

        public async Task<TokenDto> GetTokenDataForUserAsync(int userId)
        {
            (DateTime? expiresAt, DateTime? revokedAt, string hash) result =
                await _userTokenRepository.GetTokenDataForUserAsync(userId);

            if (result is (null, null, null))
                return null;

            return new TokenDto
            {
                ExpiresAt = result.expiresAt,
                RevokedAt = result.revokedAt,
                Hash = result.hash
            };
        }

        public async Task<bool?> RefreshAsync(int userId, string refreshToken, DateTime refreshTokenExpiresAt) =>
            await _userTokenRepository.RefreshAsync(userId, _passwordHasher.HashToken(refreshToken), refreshTokenExpiresAt);

        public async Task<string> GetRefreshTokenHashForUserAsync(int userId) =>
            await _userTokenRepository.GetRefreshTokenHashForUserAsync(userId);

        public async Task<bool?> LogoutAsync(int userId, DateTime refreshTokenRevokedAt) =>
            await _userTokenRepository.LogoutAsync(userId, refreshTokenRevokedAt);
    }
}
