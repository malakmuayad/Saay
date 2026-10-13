namespace Saay.Services.Interfaces
{
    public interface IEmailService
    {
        public Task<bool> SendConfirmationEmailAsync(string to, string subject, string recipientName, string confirmationUrl);

        public Task<bool> SendConfirmationPasswordAsync(string to, string subject, string recipientName, string code);
    }
}
