using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Saay.Infrastructure.DTOs.AuthDTOs;
using Saay.Infrastructure.DTOs.TokenDTOs;
using Saay.Infrastructure.DTOs.UserDTOs;
using Saay.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;

namespace Saay.API.Controllers
{
    [Route("api/saay/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;
        private readonly IConfiguration _configuration;
        private readonly IUserTokenService _userTokenService;

        private readonly IOwnershipAuthorizationService _ownershipAuthorizationService;

        private readonly ILogger<AuthController> _logger;

        public AuthController(IUserService userService, IPasswordHasher passwordHasher,
            ITokenService tokenService, IConfiguration configuration, IUserTokenService usertoken,
            ILogger<AuthController> logger, IOwnershipAuthorizationService ownershipAuthorizationService)
        {
            _userService = userService;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
            _configuration = configuration;
            _userTokenService = usertoken;
            _logger = logger;
            _ownershipAuthorizationService = ownershipAuthorizationService;
        }

        [EnableRateLimiting("AuthLimiter")]
        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
        {
            string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            LoginUserDto loginUserDto = await _userService.FindUserByEmailAsync(request.Email);

            if (loginUserDto == null)
            {
                _logger.LogWarning(
                    "Failed login attempt for email {Email} from IP address {ip}",
                    request.Email,
                    ip);
                return Unauthorized("Invalid credentials");
            }

            if (!_passwordHasher.VerifyPassword(request.Password, loginUserDto.PasswordHash))
            {
                _logger.LogWarning(
                    "Failed login attempt for email {Email} from IP address {ip}",
                    request.Email,
                    ip);
                return Unauthorized("Invalid credentials");
            }

            var token = _tokenService.GenerateJwtToken(loginUserDto, _configuration);

            if (token is null)
                return StatusCode(500, "JWT key missing from Key Vault");

            string accessToken = new JwtSecurityTokenHandler().WriteToken(token);

            string refreshToken = _tokenService.GenerateRefreshToken();

            bool? loginResult = await _userTokenService.LoginAsync(loginUserDto.UserId, refreshToken, DateTime.UtcNow.AddDays(7));

            if (loginResult is null)
            {
                _logger.LogError(
                    "JWT generation failed for user {UserId}.",
                    loginUserDto.UserId);
                return Unauthorized("Invalid credentials");
            }

            if (loginResult == false)
                return StatusCode(500, "An error occurred while logging in");

            return Ok(new LoginResponseDto
            {
                UserId = loginUserDto.UserId,
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });
        }

        [EnableRateLimiting("AuthLimiter")]
        [HttpPost("refresh")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequestDto request)
        {
            LoginUserDto loginUserDto = await _userService.FindUserByIdAsync(request.UserID);

            if (loginUserDto == null)
                return Unauthorized("Invalid refresh request");

            TokenDto tokenData
                = await _userTokenService.GetTokenDataForUserAsync(request.UserID);

            if (tokenData is null)
            {
                _logger.LogWarning(
                    "Failed refresh attempt for unknown user {UserId}.",
                    request.UserID);
                return Unauthorized("Invalid refresh request");
            }

            if (tokenData.RevokedAt is not null)
            {
                _logger.LogWarning(
                    "Attempt to use revoked refresh token by user {UserId}.",
                    request.UserID);
                return Unauthorized("Refresh token is revoked");
            }

            if (tokenData.ExpiresAt is null || tokenData.ExpiresAt <= DateTime.UtcNow)
            {
                _logger.LogWarning(
                    "Attempt to use expired refresh token by user {UserId}.",
                    request.UserID);
                return Unauthorized("Refresh token expired");
            }

            bool refreshValid = _passwordHasher.VerifyPassword(request.RefreshToken, tokenData.Hash);

            if (!refreshValid)
            {
                _logger.LogWarning(
                    "Invalid refresh token attempt by user {UserId}.",
                    request.UserID);
                return Unauthorized("Invalid refresh token");
            }

            var token = _tokenService.GenerateJwtToken(loginUserDto, _configuration);
            var newAccessToken = new JwtSecurityTokenHandler().WriteToken(token);

            // Rotation: replace refresh token
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            bool? refreshResult = await _userTokenService.RefreshAsync(loginUserDto.UserId, newRefreshToken, DateTime.UtcNow.AddDays(7));

            if (refreshResult is null)
                return Unauthorized("Invalid refresh request");

            if (refreshResult == false)
                return StatusCode(500, "An error occurred during refresh");

            return Ok(new TokenResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }

        [EnableRateLimiting("CriticalOpsLimiter")]
        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> Logout([FromBody] LogoutRequestDto request)
        {
            LoginUserDto loginUserDto = await _userService.FindUserByEmailAsync(request.Email);

            if (loginUserDto is null)
                return Ok(); // Do not reveal if user exists

            var storedHash = await _userTokenService.GetRefreshTokenHashForUserAsync(loginUserDto.UserId);

            if (string.IsNullOrEmpty(storedHash) ||
                !_passwordHasher.VerifyPassword(request.RefreshToken, storedHash))
                return Ok();

            bool? logoutResult = await _userTokenService.LogoutAsync(loginUserDto.UserId, DateTime.UtcNow);

            if (logoutResult is null)
                return Unauthorized();

            if (logoutResult == false)
                return StatusCode(500, "An error occurred while logging out");

            return Ok(true);
        }

        [EnableRateLimiting("CriticalOpsLimiter")]
        [HttpPut("{email}")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> Confirm(string email)
        {
            bool? confirmResult = await _userService.UpdateConfirmationStatusAsync(email);

            if(confirmResult is null)
                return NotFound();

            return confirmResult == true ? Ok(true) : StatusCode(500, "An error occurred while confirming email");
        }
    }
}
