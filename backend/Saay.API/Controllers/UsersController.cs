using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Saay.Infrastructure.DTOs.UserDTOs;
using Saay.Infrastructure.Validation;
using Saay.Services.Interfaces;
using System.Security.Claims;

namespace Saay.API.Controllers
{
    [Route("api/saay/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IOwnershipAuthorizationService _ownershipAuthorizationService;
        private readonly ILogger<UsersController> _logger;
        private readonly IPasswordResetTokenService _passwordResetTokenService;
        private readonly IHashService _hashService;
        private readonly IImageStorageService _imageStorageService;

        public UsersController(IUserService userService, IOwnershipAuthorizationService ownershipAuthorizationService,
            ILogger<UsersController> logger, IPasswordResetTokenService passwordResetTokenService,
            IHashService hashService, IImageStorageService imageStorageService)
        {
            _userService = userService;
            _ownershipAuthorizationService = ownershipAuthorizationService;
            _logger = logger;
            _passwordResetTokenService = passwordResetTokenService;
            _hashService = hashService;
            _imageStorageService = imageStorageService;
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult> AddUserAsync(AddUserRequestDto addUserRequestDto)
        {
            if(!ValidationRules.ValidateImageFormat(addUserRequestDto.ProfilePicture))
            {
                return BadRequest("Image type must me jpg or png.");
            }

            string? profilePictureURL = null;

            if (addUserRequestDto.ProfilePicture != null)
                profilePictureURL = await _imageStorageService.UploadAsync(addUserRequestDto.ProfilePicture);

            AddUserDto addUserDto = new AddUserDto
            {
                FirstName = addUserRequestDto.FirstName,
                LastName = addUserRequestDto.LastName,
                Email = addUserRequestDto.Email,
                Password = addUserRequestDto.Password,
                ProfilePictureURL = profilePictureURL
            };

            int? userId = await _userService.AddUserAsync(addUserDto);

            if (userId == null)
                return BadRequest("User already exists with the provided email.");

            else
            {
                GetUserDto getUserDto = new GetUserDto
                {
                    UserId = userId.Value,
                    FirstName = addUserDto.FirstName,
                    LastName = addUserDto.LastName,
                    Email = addUserDto.Email,
                    ProfilePictureUrl = addUserDto.ProfilePictureURL,
                    Mission = null
                };
                return CreatedAtRoute("GetUserById", new { userId = userId }, getUserDto);
            }
        }

        [EnableRateLimiting("CriticalOpsLimiter")]
        [Authorize]
        [HttpDelete("{userId}")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult> DeleteUserAsync(int userId)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, userId))
            {
                _logger.LogWarning("User {userId} attmpted to delete a user without ownership.",
                   userId);
                return Forbid();
            }
            
            bool? result = await _userService.DeleteUserAsync(userId);
            if (result == true)
                return Ok(true);
            else if (result == null)
                return NotFound("User not found.");
            else
                return StatusCode(500, "An error occurred while deleting the user.");
        }
        
        [Authorize]
        [HttpPut("missions")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> UpdateMissionAsync(UpdateMissionDto updateMissionDto)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, updateMissionDto.UserId))
            {
                _logger.LogWarning("User {userId} attmpted to update mission without ownership.",
                   updateMissionDto.UserId);
                return Forbid();
            }

            bool? result = await _userService.UpdateMissionAsync(updateMissionDto);
            if (result == true)
                return Ok(true);
            else if (result == null)
                return NotFound("User is not found.");
            else
                return StatusCode(500, "An error occurred while updating the mission.");
        }

        [EnableRateLimiting("CriticalOpsLimiter")]
        [Authorize]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<bool>> UpdateUserAsync(UpdateUserDto updateUserDto)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, updateUserDto.UserId))
            {
                _logger.LogWarning("User {UserId} attmpted to update a user without ownership.",
                   updateUserDto.UserId);
                return Forbid();
            }

            bool? result = await _userService.UpdateUserAsync(new UpdateUserDto
            {
                UserId = updateUserDto.UserId,
                FirstName = updateUserDto.FirstName,
                LastName = updateUserDto.LastName,
                Email = updateUserDto.Email,
            });
            if (result == true)
                return Ok(true);
            else if (result == false)
                return BadRequest("Email already exists.");
            else if (result == null)
                return NotFound("User is not found.");
            else
                return StatusCode(500, "An error occurred while updating the user.");
        }

        [EnableRateLimiting("CriticalOpsLimiter")]
        [Authorize]
        [HttpPut("passwords")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult> UpdatePasswordAsync(UpdatePasswordDto updatePasswordDto)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, updatePasswordDto.UserId))
            {
                _logger.LogWarning("User {UserId} attmpted to update password without ownership.",
                   updatePasswordDto.UserId);
                return Forbid();
            }

            bool? result = await _userService.UpdatePasswordAsync(updatePasswordDto);
            if (result == true)
                return Ok(true);
            else if (result == null)
                return NotFound("User is not found.");
            else
                return StatusCode(500, "An error occurred while updating the password.");
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [HttpGet("{userId}", Name = "GetUserById")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<GetUserDto>> GetUserByIdAsync(int userId)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, userId))
            {
                _logger.LogWarning("User {userId} attmpted to get user without ownership.",
                   userId);
                return Forbid();
            }

            GetUserDto? user = await _userService.GetUserByIdAsync(userId);

            if (user != null)
                return Ok(user);
            else
                return NotFound("User not found.");
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [HttpGet("email/{email}")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<GetUserDto>> GetUserByEmailAsync(string email)
        {
            int userId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (!await _ownershipAuthorizationService.IsEmailOwnerAsync(User, email))
            {
                _logger.LogWarning("User {userId} attmpted to user without ownership.",
                   userId);
                return Forbid();
            }

            GetUserDto? user = await _userService.GetUserByEmailAsync(email);

            if(user == null)
                return NotFound("User not found.");

            return Ok(user);
        }


        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [HttpGet("mission/{userId}")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<string?>> GetUserMission(int userId)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, userId))
            {
                _logger.LogWarning("User {userId} attmpted to user without ownership.",
                   userId);
                return Forbid();
            }

            return Ok(await _userService.GetUserMissionAsync(userId));
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [HttpGet("userEmail/{userId}")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<string?>> GetUserEmail(int userId)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, userId))
            {
                _logger.LogWarning("User {userId} attmpted to get email without ownership.",
                   userId);
                return Forbid();
            }

            return Ok(await _userService.GetUserEmailAsync(userId));
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [HttpGet("confirmation/{userId}")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<bool>> IsConfirmedAsync(int userId)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, userId))
            {
                _logger.LogWarning("User {userId} attmpted to get confirmation status without ownership.",
                   userId);
                return Forbid();
            }

            bool? result = (await _userService.IsConfirmedAsync(userId));

            if (result == null)
                return NotFound("User not found.");
            else
                return Ok(result);
        }

        [EnableRateLimiting("AuthLimiter")]
        [HttpPut("verify-forget-password")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<bool>> VerifyForgetPassword(VerifyPasswordDto verifyPasswordDto)
        {
            if (_hashService.HashToken(verifyPasswordDto.Code) != await _passwordResetTokenService.GetTokenAsync(verifyPasswordDto.Email))
            {
                return Ok(false);
            }

            return Ok(true);
        }


        // should be handled in a transaction
        [EnableRateLimiting("AuthLimiter")]
        [HttpPut("forget-password")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<bool>> ForgetPassword(ForgetPasswordDto forgetPasswordDto)
        {
            int? userId = await _userService.GetUserIdByEmailAsync(
                forgetPasswordDto.Email);

            if (userId == null)
                return NotFound("User not found.");

            string? token = await _passwordResetTokenService.GetTokenAsync(
                forgetPasswordDto.Email);

            if (string.IsNullOrWhiteSpace(token))
                return BadRequest("Invalid or expired password reset code.");

            // Validate that the token is valid, unexpired, and unused here.
            // Prefer a service method that verifies the exact token.
            // ensure that the token is not expired yet
            bool? result = await _userService.UpdatePasswordAsync(
                new UpdatePasswordDto
                {
                    UserId = userId.Value,
                    NewPassword = forgetPasswordDto.NewPassword
                });

            if (result == null)
                return NotFound("User not found.");

            if (result == false)
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    "An error occurred while updating the password.");

            bool tokenMarkedAsUsed = await _passwordResetTokenService
                .MarkAsUsedAsync(userId.Value, token);

            if (!tokenMarkedAsUsed)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    "The password was updated, but the reset code could not be invalidated.");
            }

            return Ok(true);
        }


        [EnableRateLimiting("CriticalOpsLimiter")]
        [Authorize]
        [HttpPut("profile-picture")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<bool>> UpdateProfilePictureAsync(UpdateProfilePictureDto updateProfilePictureDto)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, updateProfilePictureDto.UserId))
            {
                _logger.LogWarning("User {UserId} attmpted to update a user without ownership.",
                   updateProfilePictureDto.UserId);
                return Forbid();
            }

            bool? result = await _userService.UpdateProfilePictureAsync(updateProfilePictureDto);
            if (result == true)
                return Ok(true);
            else if (result == null)
                return NotFound("User is not found.");
            else
                return StatusCode(500, "An error occurred while updating the user.");
        }

        [EnableRateLimiting("CriticalOpsLimiter")]
        [Authorize]
        [HttpDelete("profile-picture/{userId}")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult> DeleteProfilePictureAsync(int userId)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, userId))
            {
                _logger.LogWarning("User {userId} attmpted to delete a user without ownership.",
                   userId);
                return Forbid();
            }

            bool? result = await _userService.DeleteProfilePictureAsync(userId);
            if (result == true)
                return Ok(true);
            else if (result == null)
                return NotFound("User not found.");
            else
                return StatusCode(500, "An error occurred while deleting the user.");
        }
    }
}
