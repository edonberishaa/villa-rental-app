
using Microsoft.AspNetCore.Mvc;
using api.Services.Interfaces;
using api.Data;
using Microsoft.AspNetCore.Authorization;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        public PaymentsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

                [HttpPost("villa-promote")]
        [Authorize]
        public async Task<IActionResult> PromoteVilla([FromBody] PromoteVillaRequest req, [FromServices] IPaymentService paymentService, [FromServices] AppDbContext db)
        {
            // Validate villa exists and belongs to user
            var villa = await db.Villas.FindAsync(req.VillaId);
            if (villa == null) return NotFound("Villa not found");
            var email = User?.Identity?.Name ?? User?.FindFirst("email")?.Value;
            if (!string.Equals(villa.OwnerEmail, email, System.StringComparison.OrdinalIgnoreCase)) return Forbid();
            // Check if already promoted
            if (villa.PromotedUntil != null && villa.PromotedUntil > DateTime.UtcNow)
                return BadRequest("Villa is already promoted");
            var clientSecret = await paymentService.CreatePaymentIntentAsync(4m, "eur", $"VILLA-{villa.Id}", "Promote villa");
            return Ok(new { clientSecret });
        }

        public class PromoteVillaRequest
        {
            public int VillaId { get; set; }
        }
        [HttpGet("publishable-key")]
        public IActionResult GetPublishableKey()
        {
            var key = _configuration["Stripe:PublishableKey"];
            if (string.IsNullOrWhiteSpace(key)) return NotFound();
            return Ok(new { publishableKey = key });
        }
        [HttpPost("villa-listing")]
        [Authorize]
        public async Task<IActionResult> CreateVillaListingPayment([FromBody] VillaListingPaymentRequest req, [FromServices] IPaymentService paymentService, [FromServices] AppDbContext db)
        {
            // Validate submission exists and belongs to user
            var submission = await db.PropertySubmissions.FindAsync(req.SubmissionId);
            if (submission == null) return NotFound("Submission not found");
            var email = User?.Identity?.Name ?? User?.FindFirst("email")?.Value;
            if (!string.Equals(submission.OwnerEmail, email, System.StringComparison.OrdinalIgnoreCase)) return Forbid();
            var amount = req.Promoted ? 7m : 3m;
            var description = req.Promoted ? "Promoted villa listing" : "Villa listing";
            var clientSecret = await paymentService.CreatePaymentIntentAsync(amount, "eur", $"SUBM-{submission.Id}", description);
            return Ok(new { clientSecret });
        }
    }

    public class VillaListingPaymentRequest
    {
        public int SubmissionId { get; set; }
        public bool Promoted { get; set; }
    }
}


