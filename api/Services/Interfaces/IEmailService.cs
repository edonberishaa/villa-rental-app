namespace api.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendAsync(string toEmail, string subject, string htmlContent, string? fromEmail = null);
    }
}


