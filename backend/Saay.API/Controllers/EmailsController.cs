using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Saay.Data.Entities;
using Saay.Infrastructure.DTOs.UserDTOs;
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

        private readonly IHashService _hashService;

        public EmailsController(IUserService userService, IEmailService emailService,
            ITokenService tokenService, IPasswordResetTokenService passwordResetTokenService,
            IHashService hashService)
        {
            _userService = userService;
            _emailService = emailService;
            _tokenService = tokenService;
            _passwordResetTokenService = passwordResetTokenService;
            _hashService = hashService;
        }

        [EnableRateLimiting("AuthLimiter")]
        [HttpGet("reset-password/{email}")]
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

        [EnableRateLimiting("AuthLimiter")]
        [HttpGet("resend-confirmation/{to}")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> SendConfirmationEmail(string to)
        {
            if (!Regex.IsMatch(to, ValidationRules.EMAIL_REGX))
                return BadRequest("Invalid email format.");

            bool? result = await _userService.ResendConfirmationEmailAsync(to);

            if (result == null)
                return NotFound("User not found.");

            return Ok(result);
        }
    }
}
