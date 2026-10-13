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

        private MimeMessage _GenerateConfirmationMessage(string EmailFrom, string EmailTo, string Receiver, string Sender, string confirmationUrl)
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
                    <a href="{confirmationUrl}">
                        Verify my email
                    </a>
                </p>
                <p>Please note that this link will expire in 24 hours.</p>
                <p>If you didn't create a Saay account, you can ignore this email.</p>
                """
            };
            return message;
        }

        public async Task<bool> SendConfirmationEmailAsync(string to, string subject, string recipientName, string confirmationURL)
        {
            MimeMessage Message = _GenerateConfirmationMessage(_emailFrom, to, recipientName, "Saay سعي", confirmationURL);

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

        private MimeMessage _GeneratePasswordConfirmationMessage(string EmailFrom, string EmailTo, string Receiver, string Sender, string code)
        {
            MimeMessage message = new MimeMessage();
            message.From.Add(new MailboxAddress(Sender, EmailFrom));
            message.To.Add(new MailboxAddress(Receiver, EmailTo));
            message.Subject = "Reset Your Password";
            message.Body = new TextPart("html")
            {
                Text = $"""
                <h2>Reset Your Password</h2>

                <p>You have requested to reset your password. Please enter the following code:</p>

                <p>
                {code}
                </p>
                <p>Please note that this code will expire in 10 minutes.</p>
               """
            };
            return message;
        }

        public async Task<bool> SendConfirmationPasswordAsync(string to, string subject, string recipientName, string code)
        {
            MimeMessage Message = _GeneratePasswordConfirmationMessage(_emailFrom, to, recipientName, "Saay سعي", code);

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
