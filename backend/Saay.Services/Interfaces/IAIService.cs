
namespace Saay.Services.Interfaces
{
    public interface IAIService
    {
        public Task<string> GetReplyAsync(
        string userName,
        IReadOnlyList<AIChatMessageDto> messages,
        CancellationToken cancellationToken = default);
    }
}
