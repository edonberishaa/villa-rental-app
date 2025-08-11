using api.Services.Interfaces;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace api.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendAsync(string toEmail, string subject, string htmlContent, string? fromEmail = null)
        {
            var apiKey = _configuration["SendGrid:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogWarning("SendGrid API key missing; skipping email send to {To}", toEmail);
                return;
            }
            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(fromEmail ?? _configuration["SendGrid:FromEmail"] ?? "no-reply@villarent.local", "VillaRent");
            var to = new EmailAddress(toEmail);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent: null, htmlContent);
            var response = await client.SendEmailAsync(msg);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("SendGrid failed with status {Status}", response.StatusCode);
            }
        }
    }
}


