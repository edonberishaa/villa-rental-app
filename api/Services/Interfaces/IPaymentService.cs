namespace api.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<string> CreatePaymentIntentAsync(decimal amount, string currency, string reservationCode, string? description = null);
    }
}


