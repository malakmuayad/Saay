using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Saay.Infrastructure.DTOs.UserDTOs;
using Saay.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Saay.Services.Classes
{

    public class TokenService : ITokenService
    {
        public string GenerateRefreshToken()
        {
            byte[] bytes = new byte[64];
            using RandomNumberGenerator rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }

        public JwtSecurityToken GenerateJwtToken(LoginUserDto loginUserDto, IConfiguration Configuration)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, loginUserDto.UserId.ToString()),
            };

            var secretKey = Configuration["JwtSigningKey"];

            if (string.IsNullOrWhiteSpace(secretKey))
                return null;

            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            SigningCredentials creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            return new JwtSecurityToken(
                issuer: "SaayAPI",
                audience: "SaayAPIUsers",
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: creds
            );
        }

        public string GenerateEmailConfirmationToken()
        {
            byte[] bytes = RandomNumberGenerator.GetBytes(32);
            return Convert.ToBase64String(bytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }
        public string HashToken(string token)
        {
            byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(bytes);
        }
    }
}
