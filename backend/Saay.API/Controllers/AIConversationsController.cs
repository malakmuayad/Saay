using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Saay.Infrastructure.DTOs.AIConversationDTOs;
using Saay.Services.Interfaces;
using MailKit.Security;
using MimeKit;

namespace Saay.API.Controllers
{
    [Route("api/saay/ai")]
    [ApiController]
    public class AIConversationsController : ControllerBase
    {
        private readonly IAIConversationService _aiConversationService;
        private readonly ILogger<AIConversationsController> _logger;
        private readonly IOwnershipAuthorizationService _ownershipAuthorizationService;

        public AIConversationsController(IAIConversationService aiConversationService, ILogger<AIConversationsController> logger, IOwnershipAuthorizationService ownershipAuthorizationService)
        {
            _aiConversationService = aiConversationService;
            _logger = logger;
            _ownershipAuthorizationService = ownershipAuthorizationService;
        }

        [EnableRateLimiting("LightOpsLimiter")]
        [Authorize]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<string>> SendAIMessage(MessageDto messageDto)
        {
            if (!await _ownershipAuthorizationService.IsOwnerAsync(User, messageDto.UserId))
            {
                _logger.LogWarning("User {userId} attempted to send a message without ownership.",
                   messageDto.UserId);
                return Forbid();
            }
            string aiResponse = await _aiConversationService.SendMessage(messageDto.UserId, messageDto.Message);
            return Ok(aiResponse);
        }
    }
}
