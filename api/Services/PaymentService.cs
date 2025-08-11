using api.Services.Interfaces;
using Stripe;

namespace api.Services
{
    public class PaymentService : IPaymentService
    {
        public PaymentService(IConfiguration configuration)
        {
            StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"];
        }

        public async Task<string> CreatePaymentIntentAsync(decimal amount, string currency, string reservationCode, string? description = null)
        {
            var service = new PaymentIntentService();

            var createOptions = new PaymentIntentCreateOptions
            {
                Amount = (long)Math.Round(amount * 100m),
                Currency = currency,
                Description = description ?? $"Reservation {reservationCode}",
                Metadata = new Dictionary<string, string>
                {
                    { "reservation_code", reservationCode }
                },
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true
                }
            };

            var intent = await service.CreateAsync(createOptions);
            return intent.ClientSecret;
        }
    }
}


