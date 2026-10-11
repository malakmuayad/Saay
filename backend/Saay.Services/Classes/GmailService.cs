using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using Saay.Services.Interfaces;

namespace Saay.Services.Classes
{
    public class GmailService : IEmailService
    {
        private readonly ILogger<GmailService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _SMTPServer;
        private readonly int _portNumber;
        private readonly string _authenticationPassword;
        private readonly string _emailFrom;

        public GmailService(IConfiguration configuration, ILogger<GmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _SMTPServer = "smtp.gmail.com";
            _portNumber = 587;
            _authenticationPassword = _configuration["AuthenticationPassword"];
            _emailFrom = _configuration["EmailFrom"];
        }

        private MimeMessage GenerateConfirmationMessage(string EmailFrom, string EmailTo, string Receiver, string Sender)
        {
            MimeMessage message = new MimeMessage();
            message.From.Add(new MailboxAddress(Sender, EmailFrom));
            message.To.Add(new MailboxAddress(Receiver, EmailTo));
            message.Subject = "Confirm your account";
            message.Body = new TextPart("html")
            {
                Text = $"""
                <h2>Welcome to Saay, {Receiver}!</h2>

                <p>Please verify your email address by clicking the link below:</p>

                <p>
                    <a href="saay.vercel.app/confirm">
                        Verify my email
                    </a>
                </p>

                <p>If you didn't create a Saay account, you can ignore this email.</p>
                """
            };
            return message;
        }

        public async Task<bool> SendConfirmationEmailAsync(string to, string subject, string recipientName)
        {
            MimeMessage Message = GenerateConfirmationMessage(_emailFrom, to, recipientName, "Saay سعي");

            try
            {
                using (var Client = new SmtpClient())
                {
                    await Client.ConnectAsync(_SMTPServer, Convert.ToInt32(_portNumber), MailKit.Security.SecureSocketOptions.StartTls);
                    await Client.AuthenticateAsync(_emailFrom, _authenticationPassword);
                    _logger.LogInformation(await Client.SendAsync(Message));
                    await Client.DisconnectAsync(true);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending email: {ex.Message}");
                return false;
            }
            _logger.LogInformation($"Email sent successfully to {to}");
            return true;
        }
    }
}
