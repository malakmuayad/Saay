using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Saay.Services.Interfaces;
using System.Security.Claims;

namespace Saay.API.Controllers
{
    [Route("api/saay/ai")]
    [ApiController]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;

        private readonly IUserService _userService;

        public AIController(IUserService userService, IAIService aiService)
        {
            _aiService = aiService;
            _userService = userService;
        }

        [HttpPost]
        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<string>> Chat([FromBody] AIChatRequestDto requestDto, CancellationToken cancellationToken)
        {
            if (requestDto.Messages is null ||
                requestDto.Messages.Count == 0)
            {
                return BadRequest(
                    "At least one message is required.");
            }

            if (requestDto.Messages.Count > 20)
            {
                return BadRequest(
                    "Too many messages in one request.");
            }

            if (requestDto.Messages.Any(m =>
                m.Content is null || m.Content.Length > 8000))
            {
                return BadRequest(
                    "A message is too long.");
            }

            string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            string? reply = await _aiService.GetReplyAsync(
                await _userService.GetNameAsync(userId) ?? "",
                requestDto.Messages,
                cancellationToken);

            return Ok(reply);
        }
    }
}
