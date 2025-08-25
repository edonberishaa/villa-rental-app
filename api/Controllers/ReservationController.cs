
using api.DTOs;
using api.Services;
using api.Services.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using api.Data;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _service;
        private readonly IMapper _mapper;
        private readonly IPaymentService _paymentService;
        private readonly IEmailService _emailService;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<ReservationController> _logger;

        public ReservationController(IReservationService service,IMapper mapper, IPaymentService paymentService, IEmailService emailService, AppDbContext dbContext, ILogger<ReservationController> logger)
        {
            _service = service;
            _mapper = mapper;
            _paymentService = paymentService;
            _emailService = emailService;
            _dbContext = dbContext;
            _logger = logger;
        }

        // Get all reserved date ranges for a villa
        [HttpGet("villa/{villaId}/dates")]
        public async Task<IActionResult> GetReservedDatesForVilla(int villaId)
        {
            var reservations = await _dbContext.Reservations
                .Where(r => r.VillaId == villaId && r.EndDate >= DateTime.UtcNow)
                .Select(r => new { r.StartDate, r.EndDate })
                .ToListAsync();
            return Ok(reservations);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationRequestDTO request)
        {
            try
            {
                var result = await _service.CreateReservationAsync(request);

                var clientSecret = await _paymentService.CreatePaymentIntentAsync(
                    result.FeeAmount,
                    "eur",
                    result.ReservationCode,
                    "Reservation deposit"
                );

                return Ok(new
                {
                    message = "Reservation created. Please complete the payment.",
                    reservationCode = result.ReservationCode,
                    feeAmount = result.FeeAmount,
                    clientSecret
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("check-availability")]
        public async Task<IActionResult> CheckAvailability([FromBody] ReservationRequestDTO request)
        {
            bool isAvailable = await _service.IsVillaAvailableAsync(request.VillaId, request.StartDate, request.EndDate);
            if (!isAvailable)
                return BadRequest(new { message = "Villa is not available for the selected dates." });

            return Ok(new { message = "Villa is available." });
        }
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllReservations()
        {
            var reservations = await _service.GetAllReservationsAsync();
            return Ok(reservations);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReservationById(int id)
        {
            var reservation = await _service.GetReservationByIdAsync(id);
            if (reservation == null) return NotFound(new { message = "Reservation not found." });

            return Ok(reservation);
        }
        [HttpPut("{id}/confirm")]
        public async Task<IActionResult> ConfirmReservation(int id)
        {
            var success = await _service.ConfirmReservationAsync(id);
            if (!success)
                return NotFound(new { message = "Reservation not found or already confirmed." });

            return Ok(new {message = "Reservation confirmed."});
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            try
            {
                var signatureHeader = Request.Headers["Stripe-Signature"]; 
                var endpointSecret = HttpContext.RequestServices
                    .GetRequiredService<IConfiguration>()
                    ["Stripe:WebhookSecret"];

                var stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, endpointSecret);

                if (stripeEvent.Type == Events.PaymentIntentSucceeded)
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    if (paymentIntent != null && paymentIntent.Metadata.TryGetValue("reservation_code", out var code))
                    {
                        // lookup by reservation code, then confirm and send email
                        var reservation = await _dbContext.Reservations.Include(r=>r.Villa).FirstOrDefaultAsync(r=>r.ReservationCode == code);
                        if (reservation != null)
                        {
                            await _service.ConfirmReservationByCodeAsync(code);

                            if (!string.IsNullOrWhiteSpace(reservation.GuestEmail))
                            {
                                var subject = $"Your reservation {reservation.ReservationCode} is confirmed";
                                var html = $"<p>Hi {reservation.GuestName},</p>" +
                                           $"<p>Your reservation for <strong>{reservation.Villa.Name}</strong> from {reservation.StartDate:yyyy-MM-dd} to {reservation.EndDate:yyyy-MM-dd} is confirmed.</p>" +
                                           $"<p>Reservation code: <strong>{reservation.ReservationCode}</strong></p>" +
                                           "<p>We look forward to hosting you!</p>";
                                await _emailService.SendAsync(reservation.GuestEmail!, subject, html);
                            }
                        }
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stripe webhook error");
                return BadRequest();
            }
        }
    }
}
