using Microsoft.EntityFrameworkCore;
using Saay.Data;
using Saay.Data.Entities;
using Saay.Repository.Interfaces;

namespace Saay.Repository.Classes
{
    public class AIConversationRepository : IAIConversationRepository
    {
        private readonly SaayContext _context;

        public AIConversationRepository(SaayContext context)
        {
            _context = context;
        }
        public async Task<bool?> AddInteractionId(string interactionId, int userId)
        {
            _context.AIConversations.Add(new AIConversation
            {
                PreviousInteractionId = interactionId,
                UserId = userId
            });
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<string?> GetInteractionId(int userId)
        {
            AIConversation conversation =
                await _context.AIConversations
                .OrderByDescending(x => x.ConversationId)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            return conversation?.PreviousInteractionId;
        }

        public async Task<bool?> UpdateInteractionId(string newInteractionId, int userId)
        {
            AIConversation conversation = await _context.AIConversations
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (!await IsFirstTime(userId) && conversation == null)
                return null;

            conversation.PreviousInteractionId = newInteractionId;
            _context.AIConversations.Update(conversation);
            return await _context.SaveChangesAsync() >= 0;
        }

        public async Task<bool> IsFirstTime(int userId) =>
            await _context.AIConversations.AnyAsync(c => c.UserId == userId);
    }
}
