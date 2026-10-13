using Microsoft.Extensions.Configuration;
using Saay.Infrastructure.DTOs.UserDTOs;
using System.IdentityModel.Tokens.Jwt;

namespace Saay.Services.Interfaces
{
    public interface ITokenService
    {
        public string GenerateRefreshToken();

        public JwtSecurityToken GenerateJwtToken(LoginUserDto loginUserDto, IConfiguration Configuration);

        public string GenerateEmailConfirmationToken();

        public string GenerateResetCode();
    }
}
