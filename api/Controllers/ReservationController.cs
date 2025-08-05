using api.DTOs;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly ReservationService _service;

        public ReservationController(ReservationService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationRequestDTO request)
        {
            try
            {
                var result = await _service.CreateReservationAsync(request);
                return Ok(new
                {
                    message = "Reservation created. Please pay the reservation fee.",
                    reservationCode = result.ReservationCode,
                    feeAmount = result.FeeAmount
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
    }
}
