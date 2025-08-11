using Microsoft.AspNetCore.Mvc;

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

        [HttpGet("publishable-key")]
        public IActionResult GetPublishableKey()
        {
            var key = _configuration["Stripe:PublishableKey"];
            if (string.IsNullOrWhiteSpace(key)) return NotFound();
            return Ok(new { publishableKey = key });
        }
    }
}


