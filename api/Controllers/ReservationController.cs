using api.DTOs;
using api.Services;
using api.Services.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _service;
        private readonly IMapper _mapper;

        public ReservationController(IReservationService service,IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
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
        [HttpGet]
        public async Task<IActionResult> GetAllReservations()
        {
            var reservations = await _service.GetAllReservationsAsync();
            return Ok(reservations);
        }
        [HttpGet("id")]
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
    }
}
