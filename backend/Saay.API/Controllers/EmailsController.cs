using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Saay.Infrastructure.Validation;
using Saay.Services.Interfaces;
using System.Text.RegularExpressions;

namespace Saay.API.Controllers
{
    [Route("api/saay/emails")]
    [ApiController]
    public class EmailsController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IEmailService _emailService;
        private readonly ITokenService _tokenService;
        private readonly IPasswordResetTokenService _passwordResetTokenService;

        public EmailsController(IUserService userService, IEmailService emailService, ITokenService tokenService, IPasswordResetTokenService passwordResetTokenService)
        {
            _userService = userService;
            _emailService = emailService;
            _tokenService = tokenService;
            _passwordResetTokenService = passwordResetTokenService;
        }

        [EnableRateLimiting("AuthLimiter")]
        [HttpGet("{email}")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> SendResetPasswordEmail(string email)
        {
            if(!Regex.IsMatch(email, ValidationRules.EMAIL_REGX))
                return BadRequest("Invalid email format.");

            if(!await _userService.DoesEmailExist(email))
                return NotFound("Email not found. Sign up to create an account.");
            
            string token = _tokenService.GenerateResetCode();

            bool tokenSaved = await _passwordResetTokenService.CreatePasswordResetTokenAsync(await _userService.GetUserIdByEmailAsync(email) ?? 0, token, DateTime.UtcNow.AddMinutes(10));

            bool result = await _emailService.SendConfirmationPasswordAsync(email, "Reset Your Password", email, token);

            if (!result)
                return StatusCode(StatusCodes.Status500InternalServerError, "Failed to send reset password email.");

            return Ok(true);
        }
    }
}
