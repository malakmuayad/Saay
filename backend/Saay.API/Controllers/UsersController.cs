using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Saay.Infrastructure.DTOs.UserDTOs;
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

        public UsersController(IUserService userService, IOwnershipAuthorizationService ownershipAuthorizationService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _ownershipAuthorizationService = ownershipAuthorizationService;
            _logger = logger;
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult> AddUserAsync(AddUserDto addUserDto)
        {
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

            bool? result = await _userService.UpdateUserAsync(updateUserDto);
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
    }
}
